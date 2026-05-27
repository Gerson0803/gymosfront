export type CheckInMemberOption = {
  id: string;
  name: string;
  hasBiometricCredential: boolean;
};

export type CheckInMemberOptionsResponse = {
  success: boolean;
  data: CheckInMemberOption[];
};

export type BiometricCheckInRequest = {
  memberId?: string;
  credentialId: string;
  duration?: number;
  activities?: string[];
};

export type BiometricCheckInResponse = {
  success: boolean;
  message?: string;
  data?: {
    memberId: string;
    memberName: string;
    attendance: {
      date: string;
      duration: number;
      activities: string[];
    };
  };
};

export type BiometricMemberStatusResponse = {
  success?: boolean;
  hasCredential?: boolean;
  data?: {
    hasCredential?: boolean;
  };
};
