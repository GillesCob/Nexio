import { ContactStatus } from "@prisma/client";
import { AppError } from "../middlewares/errorMiddleware";
import { prisma } from "../lib/prisma";

interface ICreateContactData {
  name: string;
  company?: string;
  linkedinUrl?: string;
  jobTitle?: string;
  status?: ContactStatus;
  notes?: string;
  jobOfferId?: string;
  companyId?: string;
  contactedAt?: string;
}

interface IUpdateContactData {
  name?: string;
  company?: string;
  linkedinUrl?: string;
  jobTitle?: string;
  status?: ContactStatus;
  notes?: string;
  jobOfferId?: string;
  companyId?: string;
}

async function assertOwnership(userId: string, contactId: string) {
  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!contact || contact.userId !== userId) {
    throw new AppError(404, "Contact not found");
  }
  return contact;
}

export async function createContact(userId: string, data: ICreateContactData) {
  const { contactedAt, ...rest } = data;
  const createData = contactedAt ? { ...rest, userId, status: "contacted" as ContactStatus } : { ...rest, userId };

  const contact = await prisma.contact.create({ data: createData });

  if (contactedAt) {
    return prisma.contact.update({
      where: { id: contact.id },
      data: { updatedAt: new Date(contactedAt) },
    });
  }

  return contact;
}

export async function getContacts(userId: string) {
  return prisma.contact.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { companyRef: true },
  });
}

export async function getContactById(userId: string, contactId: string) {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: { companyRef: true },
  });
  if (!contact || contact.userId !== userId) {
    throw new AppError(404, "Contact not found");
  }
  return contact;
}

export async function updateContact(userId: string, contactId: string, data: IUpdateContactData) {
  const { companyId, company, ...rest } = data;
  const shouldPreserveUpdatedAt = Object.keys(rest).length === 0;
  await assertOwnership(userId, contactId);
  const current = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { updatedAt: true },
  });
  return prisma.contact.update({
    where: { id: contactId },
    data: shouldPreserveUpdatedAt ? { companyId, company, updatedAt: current?.updatedAt } : data,
  });
}

export async function deleteContact(userId: string, contactId: string) {
  await assertOwnership(userId, contactId);
  await prisma.contact.delete({ where: { id: contactId } });
}

export async function touchContact(userId: string, contactId: string) {
  await assertOwnership(userId, contactId);
  return prisma.contact.update({
    where: { id: contactId },
    data: { updatedAt: new Date() },
  });
}
