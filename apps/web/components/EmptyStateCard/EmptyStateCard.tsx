import { FC } from "react";
import "./EmptyStateCard.scss";

const EmptyStateCard: FC = () => {
  return (
    <>
      <div className="empty-card-container" data-testid="empty-card-state">
        <div className="empty-card-skeleton">
          <div className="empty-card-header-text"></div>
        </div>
      </div>
    </>
  );
};

export default EmptyStateCard;