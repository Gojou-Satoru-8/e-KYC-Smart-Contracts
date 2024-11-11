const MainLayout = ({ children }) => {
  return (
    // <main className="w-[95%] sm:w-[4/5] mx-auto  py-8 shadow-lg">
    // <main className="my-4 grid grid-cols-[22%_auto] grid-rows-1 w-full h-[85vh]">
    //   <dialog className="modal">Hello world</dialog>
    //   <SidebarHome className={"rounded-r-2xl shadow-xl bg-white"} />
    //   <Content title={title}>{children}</Content>
    // </main>
    // <main className="my-4 grid grid-cols-[20%_auto] grid-rows-1 w-full">{children}</main>
    <main className="my-4 flex flex-row w-full h-[85vh]">{children}</main>
  );
};

export default MainLayout;
