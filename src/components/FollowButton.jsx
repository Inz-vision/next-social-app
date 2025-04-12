'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function FollowButton({ user: userFromProfilePage }) {
  const router = useRouter();
  const { user } = useUser();

  const handleFollow = async () => {
    if (!user.publicMetadata.userMongoId) {
      console.error('User Mongo ID is missing.');
      return;
    }

    console.log('user.publicMetadata.userMongoId:', user.publicMetadata.userMongoId);

    try {
      const res = await fetch('/api/user/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfileId: userFromProfilePage._id,
          userWhofollowsId: user.publicMetadata.userMongoId,
        }),
      });

      const result = await res.json();

      if (res.status === 200) {
        console.log(result.message);
        router.refresh();
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error('Failed to follow/unfollow user:', error);
    }
  };

  return (
    <button
      onClick={handleFollow}
      className='bg-blue-500 text-white px-4 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed'
      disabled={
        !user || user.publicMetadata.userMongoId === userFromProfilePage._id
      }
    >
      {user &&
      userFromProfilePage.followers.includes(user.publicMetadata.userMongoId)
        ? 'Unfollow'
        : 'Follow'}
    </button>
  );
}