export const ShowInfo = (props) => {
  return (
    <div className="info-card d-flex align-items-center gap-3 mb-3">

      <div className="info-icon">
        {props.icon}
      </div>

      <div>
        <h5 className="fw-bold mb-1">
          {props.h}
        </h5>

        <p className="text-secondary mb-1">
          {props.desc}
        </p>

        <a
          href="#"
          className="info-link text-decoration-none"
        >
          {props.con}
        </a>
      </div>

    </div>
  );
};