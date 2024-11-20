import { Card, Skeleton } from "@nextui-org/react";
import MainLayout from "../components/MainLayout";
import SidebarHome from "../components/SidebarHome";
import Content from "../components/Content";

const HomeFeedSkeletons = () => {
  //   const array = new Array(6).fill(0).map((_, i) => i + 1);
  const array = Array.from({ length: 6 }, (_, i) => i + 1);
  // console.log(array);

  return (
    <MainLayout>
      <SidebarHome styles={"default"} />
      <Content>
        <div className="mt-10 grid xl:grid-cols-4 md:grid-cols-[repeat(3,31%)] sm:grid-cols-[repeat(2,45%)] grid-cols-1 justify-center gap-8">
          {array.map((v) => (
            <Card className="space-y-5 p-4" radius="lg" key={`card-${v}`}>
              <Skeleton className="rounded-lg">
                <div className="h-24 rounded-lg bg-default-300"></div>
              </Skeleton>
              <div className="space-y-3">
                <Skeleton className="w-3/5 rounded-lg">
                  <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
                </Skeleton>
                <Skeleton className="w-4/5 rounded-lg">
                  <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
                </Skeleton>
                <Skeleton className="w-2/5 rounded-lg">
                  <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
                </Skeleton>
              </div>
            </Card>
          ))}
        </div>
      </Content>
    </MainLayout>
  );
};

export default HomeFeedSkeletons;
