import { Link } from "react-router-dom";

interface CollectionCardProps {
  title: string;
  image: string;
  link: string;
}

export const CollectionCard = ({ title, image, link }: CollectionCardProps) => {
  return (
    <Link to={link} className="group relative overflow-hidden rounded-lg">
      <div className="aspect-square w-full overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
        </div>
      </div>
    </Link>
  );
};