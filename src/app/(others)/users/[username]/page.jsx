import { HiArrowLeft } from 'react-icons/hi';
import Link from 'next/link';
import Post from '../../../../components/Post';
import FollowButton from '../../../../components/FollowButton';

export default async function UserPage({ params }) {
  const { username } = await params;
  let data = null;

  try {
    // Fetch user data
    const result = await fetch(process.env.URL + '/api/user/get', {
      method: 'POST',
      body: JSON.stringify({ username }),
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!result.ok) {
      const errorText = await result.text();
      console.error('Error fetching user data:', errorText);
      throw new Error('Failed to fetch user data');
    }

    data = await result.json();

    if (!data || !data._id) {
      console.error('User data is null or missing _id');
      return <h2 className="text-center mt-5 text-lg">User not found</h2>;
    }

    // Fetch user posts
    const userPosts = await fetch(process.env.URL + '/api/post/user/get', {
      method: 'POST',
      body: JSON.stringify({ userId: data._id }),
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!userPosts.ok) {
      const errorText = await userPosts.text();
      console.error('Error fetching user posts:', errorText);
      throw new Error('Failed to fetch user posts');
    }

    data.posts = await userPosts.json();
    console.log('User Data with Posts:', data);
  } catch (error) {
    console.error('Error fetching user or posts:', error);
    return <h2 className="text-center mt-5 text-lg">An error occurred</h2>;
  }

  return (
    <div className="max-w-xl mx-auto border-r border-l min-h-screen">
      <div className="flex items-center space-x-2 py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200">
        <Link href={'/'} className="hover:bg-gray-100 rounded-full p-2">
          <HiArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="sm:text-lg">Back</h2>
      </div>
      {!data && <h2 className="text-center mt-5 text-lg">User not found</h2>}
      {data && (
        <div className="flex items-center space-x-2 p-3 border-b border-gray-200">
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <img
                src={data.avatar}
                alt="Profile"
                className="h-16 w-16 rounded-full"
              />
              <div>
                <h2 className="text-xl font-bold">
                  {data.firstName + ' ' + data.lastName}
                </h2>
                <p className="text-gray-500">@{data.username}</p>
              </div>
            </div>

            <div className="mt-4 flex space-x-4">
              <div>
                <span className="font-bold">{data.following.length}</span>{' '}
                Following
              </div>
              <div>
                <span className="font-bold">{data.followers.length}</span>{' '}
                Followers
              </div>
            </div>
            <div className="mt-4 flex-1">
              <FollowButton user={data} />
            </div>
          </div>
        </div>
      )}
      {data && data.posts && data.posts.length === 0 && (
        <h2 className="text-center mt-5 text-lg">No posts found</h2>
      )}
      {data &&
        data.posts &&
        data.posts.map((post) => {
          return <Post key={post._id} post={post} />;
        })}
    </div>
  );
}