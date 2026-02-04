import { extractYouTubeVideoId } from '@/lib/utils';

interface YouTubeEmbedProps {
  url: string;
  className?: string;
}

export default function YouTubeEmbed({ url, className = '' }: YouTubeEmbedProps) {
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-blue-600 hover:text-blue-700 underline ${className}`}
      >
        영상 보기
      </a>
    );
  }

  return (
    <div className={`aspect-video w-full ${className}`}>
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded-lg"
      />
    </div>
  );
}
