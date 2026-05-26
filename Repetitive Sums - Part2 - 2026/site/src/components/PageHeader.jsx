import React from "react";

export default function PageHeader({ title, eyebrow, description, action }) {
  return (
    <div className="page-header">
      <div className="min-w-0">
        {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
        <h2 className="page-title">{title}</h2>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="page-action">{action}</div>}
    </div>
  );
}
