export type InvitationStatus = "draft" | "published" | "archived";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
}

export interface Invitation {
  id: string;
  userId: string;
  title: string;
  /** Unique URL slug, e.g. `emma-lucas-wedding` */
  slug: string;
  status: InvitationStatus;
  /** Cover image path under /public, or null for a generated placeholder */
  coverImage: string | null;
  /** Event date as ISO string when set */
  eventDate: string | null;
  location: string | null;
  /** Card copy and details edited in the invitation editor */
  content: import("./invitation-content").InvitationContent;
  updatedAt: string;
  createdAt: string;
}

export type InvitationSort = "updated_desc" | "updated_asc" | "title_asc" | "event_asc";
export type InvitationStatusFilter = "all" | InvitationStatus;

export interface InvitationQuery {
  sort?: InvitationSort;
  status?: InvitationStatusFilter;
  search?: string;
}

export type InvitationUpdate = {
  title?: string;
  status?: InvitationStatus;
  coverImage?: string | null;
  eventDate?: string | null;
  location?: string | null;
  content?: import("./invitation-content").InvitationContent;
};
