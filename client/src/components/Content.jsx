const Content = ({ title, children }) => {
  return (
    <div className="app-card w-full mx-4 p-8 rounded-t-xl shadow-large overflow-auto">
      {title && <h1 className="text-4xl text-center">{title}</h1>}
      {children}
    </div>
  );
};

export default Content;
