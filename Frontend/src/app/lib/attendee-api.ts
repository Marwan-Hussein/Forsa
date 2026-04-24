import { apiGet, apiPut } from "../api/api";

export interface InterestDto {
  id: number;
  name: string;
}

export interface AttendeeProfileDto {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  location: string;
  birthDate: string;
  profilePicture: string | null;
  loyaltyPoint: number;
  interests: InterestDto[];
}

export interface UpdateAttendeeProfileRequest {
  fullName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  location: string;
  birthDate: string;
}

export function getCurrentAttendeeId() {
  const storedId = window.localStorage.getItem("attendeeId");
  const configuredId = 1;
  const attendeeId = Number(storedId ?? configuredId ?? 1);

  return Number.isInteger(attendeeId) && attendeeId > 0 ? attendeeId : 1;
}

export function getAttendeeProfile(attendeeId: number) {
  return apiGet<AttendeeProfileDto>(`/api/attendees/${attendeeId}/profile`);
}

export function updateAttendeeProfile(
  attendeeId: number,
  profile: UpdateAttendeeProfileRequest
) {
  return apiPut<AttendeeProfileDto>(`/api/attendees/${attendeeId}/profile`, profile);
}

export function getAttendeeInterests(attendeeId: number) {
  return apiGet<InterestDto[]>(`/api/attendees/${attendeeId}/interests`);
}

export function getAllInterests() {
  return apiGet<InterestDto[]>(`/api/interests`);
}

export function updateAttendeeInterests(attendeeId: number, interestIds: number[]) {
  return apiPut<AttendeeProfileDto>(`/api/attendees/${attendeeId}/interests`, {
    interestIds,
  });
}