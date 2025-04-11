'use client';

import {
  HiOutlineChat,
  HiOutlineHeart,
  HiOutlineTrash,
  HiHeart,
} from 'react-icons/hi';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useModalStore } from '../store/modalStore'; // Import Zustand store

export default function Icons({ post }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || []);
  const { openModal } = useModalStore(); // Access Zustand modal store
  const { user } = useUser();
  const router = useRouter();

  const likePost = async () => {
    if (!user) {
      return router.push('/sign-in');
    }
    try {
      const response = await fetch('/api/post/like', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: post._id }),
      });

      if (response.ok) {
        if (isLiked) {
          setLikes(likes.filter((like) => like !== user.publicMetadata.userMongoId));
        } else {
          setLikes([...likes, user.publicMetadata.userMongoId]);
        }
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  useEffect(() => {
    if (user && likes?.includes(user.publicMetadata.userMongoId)) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  }, [likes, user]);

  const deletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      if (user && user.publicMetadata.userMongoId === post.user) {
        try {
          const response = await fetch('/api/post/delete', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ postId: post._id }),
          });

          if (response.ok) {
            location.reload();
          } else {
            alert('Error deleting post');
          }
        } catch (error) {
          console.error('Error deleting post:', error);
        }
      }
    }
  };

  return (
    <div className='flex justify-start gap-5 p-2 text-gray-500'>
      <div className='flex items-center'>
        <HiOutlineChat
          className='h-8 w-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 hover:text-sky-500 hover:bg-sky-100'
          onClick={() => {
            if (!user) {
              router.push('/sign-in');
            } else {
              openModal(post._id); // Open modal with the post ID
            }
          }}
        />
        {post.comments.length > 0 && (
          <span className='text-xs'>{post.comments.length}</span>
        )}
      </div>
      <div className='flex items-center'>
        {isLiked ? (
          <HiHeart
            onClick={likePost}
            className='h-8 w-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 text-red-600 hover:text-red-500 hover:bg-red-100'
          />
        ) : (
          <HiOutlineHeart
            onClick={likePost}
            className='h-8 w-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 hover:text-red-500 hover:bg-red-100'
          />
        )}
        {likes.length > 0 && (
          <span className={`text-xs ${isLiked && 'text-red-600'}`}>
            {likes.length}
          </span>
        )}
      </div>
      {user && user.publicMetadata.userMongoId === post.user && (
        <HiOutlineTrash
          onClick={deletePost}
          className='h-8 w-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 hover:text-red-500 hover:bg-red-100'
        />
      )}
    </div>
  );
}