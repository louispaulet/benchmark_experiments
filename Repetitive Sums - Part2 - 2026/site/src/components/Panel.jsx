import React from "react";

export default function Panel({ as: Tag = "section", title, description, action, className = "", children }) {
  return (
    <Tag className={`panel ${className}`.trim()}>
      {(title || description || action) && (
        <div className="panel-header">
          <div className="min-w-0">
            {title && <h3 className="panel-title">{title}</h3>}
            {description && <p className="panel-description">{description}</p>}
          </div>
          {action && <div className="panel-action">{action}</div>}
        </div>
      )}
      {children}
    </Tag>
  );
}
