import Comment from './Comment';

export default function Comments({ comments }) {
  const sortedComments = comments.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div>
      {sortedComments.map((comment) => (
        <Comment key={comment._id || comment.id} comment={comment} />
      ))}
    </div>
  );
}