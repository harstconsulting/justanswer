import { prisma } from "./db";
import { sendMail } from "./email";

type NotificationInput = {
  userId: string;
  type: string;
  payload: Record<string, unknown>;
  email?: {
    to: string;
    subject: string;
    text: string;
    html?: string;
    caseId?: string;
    debounceMinutes?: number;
  };
};

const emailDebounce = new Map<string, number>();

function canSendEmail(key: string, debounceMinutes = 5) {
  const now = Date.now();
  const last = emailDebounce.get(key) ?? 0;
  const windowMs = debounceMinutes * 60_000;
  if (now - last < windowMs) return false;
  emailDebounce.set(key, now);
  return true;
}

export async function createNotification(input: NotificationInput) {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      payloadJson: input.payload
    }
  });

  if (input.email) {
    const key = input.email.caseId
      ? `case:${input.email.caseId}:user:${input.userId}`
      : `user:${input.userId}:${input.type}`;
    if (canSendEmail(key, input.email.debounceMinutes)) {
      await sendMail({
        to: input.email.to,
        subject: input.email.subject,
        text: input.email.text,
        html: input.email.html
      });
    }
  }
}

export async function notifyMatchingExperts(caseId: string, categoryId: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  const categoryIds = [categoryId, category?.parentId].filter(Boolean) as string[];

  const experts = await prisma.expert.findMany({
    where: { verificationStatus: "verified", user: { status: "active" } },
    include: { skills: true, user: true }
  });

  const matching = experts.filter((expert) =>
    expert.skills.some((skill) => categoryIds.includes(skill.categoryId))
  );

  await Promise.all(
    matching.map((expert) =>
      createNotification({
        userId: expert.userId,
        type: "case.new",
        payload: { caseId, categoryId },
        email: {
          to: expert.user.email,
          subject: "Neue Anfrage in deinem Fachgebiet",
          text: "Es gibt eine neue Anfrage in deinem Fachgebiet. Bitte prüfe deine Queue.",
          debounceMinutes: 10
        }
      })
    )
  );
}

export async function notifyCaseClaimed(caseId: string, customerId: string, expertId: string) {
  const customer = await prisma.user.findUnique({ where: { id: customerId } });
  if (!customer) return;
  await createNotification({
    userId: customerId,
    type: "case.claimed",
    payload: { caseId, expertId },
    email: {
      to: customer.email,
      subject: "Ein Experte hat deinen Fall übernommen",
      text: "Ein Experte ist deinem Fall beigetreten. Bitte antworte im Chat, falls weitere Details nötig sind.",
      caseId
    }
  });
}

export async function notifyNewMessage(caseId: string, recipientId: string, senderRole: string) {
  const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
  if (!recipient) return;
  await createNotification({
    userId: recipientId,
    type: "message.new",
    payload: { caseId, senderRole },
    email: {
      to: recipient.email,
      subject: "Neue Nachricht im Fall",
      text: "Es gibt eine neue Nachricht in deinem Fall. Bitte öffne den Chat.",
      caseId,
      debounceMinutes: 5
    }
  });
}

export async function notifyCaseClosed(caseId: string, expertId: string) {
  const expert = await prisma.user.findUnique({ where: { id: expertId } });
  if (!expert) return;
  await createNotification({
    userId: expertId,
    type: "case.closed",
    payload: { caseId },
    email: {
      to: expert.email,
      subject: "Fall geschlossen",
      text: "Der Fall wurde geschlossen. Danke für deine Unterstützung.",
      caseId
    }
  });
}
