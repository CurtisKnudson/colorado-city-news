import { useMediator } from "@mediator/providers/mediators/mediatorProvider";
import { useUserProfileContext } from "@providers/profile";
import { useIsMounted } from "hooks/useIsMounted";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { NonUserProfile } from "types/user";
import { AdornmentInputWithValidation } from "./adornmentInputWithValidation";
import { ProfileInput } from "./profileInput";

export interface UserInfoProps {
  pageId?: string;
  viewOnly?: boolean;
  nonUserProfile?: NonUserProfile;
}

export enum ProfileUrlValidation {
  DEFAULT,
  PENDING,
  VALID,
  INVALID,
}

export const UserInfo = ({
  pageId,
  viewOnly,
  nonUserProfile,
}: UserInfoProps) => {
  const mediator = useMediator();
  const isMounted = useIsMounted();
  const [userProfileData, setUserProfileData] = useUserProfileContext();
  const { data: session } = useSession();
  const [profileUrlValidation, setProfileUrlValidation] =
    useState<ProfileUrlValidation>(ProfileUrlValidation.DEFAULT);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setUserProfileData({
      ...userProfileData,
      [name]: value,
    });
  };

  const isValid = useCallback(async () => {
    if (!session) {
      return;
    }
    if (!userProfileData.profileUrl) {
      return;
    }
    if (session?.user.profileUrl === userProfileData.profileUrl) {
      if (isMounted.current) {
        setProfileUrlValidation(ProfileUrlValidation.DEFAULT);
      }

      return;
    }
    if (isMounted.current) {
      setProfileUrlValidation(ProfileUrlValidation.PENDING);
    }

    const isValid = await mediator.validateProfileUrl(
      userProfileData.profileUrl
    );
    if (userProfileData.profileUrl.length < 1) {
      if (isMounted.current) {
        setProfileUrlValidation(ProfileUrlValidation.INVALID);
      }

      return;
    }
    if (isMounted.current) {
      setProfileUrlValidation(isValid);
    }
  }, [isMounted, mediator, session, userProfileData.profileUrl]);

  useEffect(() => {
    isValid();
  }, [isValid]);

  return (
    <div className="flex flex-col mt-8">
      {viewOnly ? (
        <div className="w-full center-all">
          {" "}
          <input
            type="text"
            name="name"
            value={nonUserProfile?.name ? nonUserProfile.name : "No Name Found"}
            placeholder="Your Name"
            className="text-center outline-none h5Headline"
            readOnly
          />
        </div>
      ) : (
        <>
          <div className="w-full center-all">
            <input
              type="text"
              name="name"
              value={userProfileData.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="text-center outline-none h5Headline"
            />
          </div>
          <ProfileInput
            label="Email:"
            type="email"
            name="email"
            onChange={handleChange}
            value={userProfileData.email}
            placeholder={userProfileData.email}
            className="text-gray-300 w-full select-none outline-none"
            readOnly
          />
          <AdornmentInputWithValidation
            label="Profile Url:"
            type="text"
            name="profileUrl"
            onChange={handleChange}
            value={userProfileData.profileUrl ? userProfileData.profileUrl : ""}
            placeholder={pageId ? pageId : ""}
            className="w-full"
            validation={profileUrlValidation}
          />
          <div className="text-gray-500 italic text-xs mt-8">
            {userProfileData.name
              ? null
              : `' **If you want to comment, post or interact on this website you must
            add a name**'`}
          </div>
        </>
      )}
    </div>
  );
};
