export default function WhoWeAre() {
  return (
    <div className="px-4">
      <div className="container mx-auto lg:mb-24 mb-16">
        <div className="bg-black lg:mt-20 mt-16 pb-12 pr-4 md:pl-0 pl-12 text-white grid md:grid-cols-2 grid-cols-1">
          <div className="md:block hidden"></div>
          <div className="mt-12 ">
            <h1 className="md:text-5xl sm:text-4xl text-3xl sofia-medium mb-5 uppercase">
              who we are
            </h1>
            <p className="2xl:text-base lg:text-15 sm:text-sm text-[12px] sm:text-left text-justify font-europa-light pr-8">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate
              ducimus voluptates architecto, sit eaque exercitationem adipisci
              rerum consequuntur necessitatibus quibusdam provident voluptatum
              porro! Suscipit explicabo voluptas porro incidunt fugiat tempore?
            </p>
          </div>
        </div>
        <div className=" grid md:grid-cols-3 grid-cols-1 gap-8">
          <img
            className="md:-mt-40 mt-8 md:w-96 w-60 object-cover"
            src="../../assets/images/about/image-13.jpg"
            alt=""
          />
          <img
            className=" justify-self-center lg:mt-24 md:mt-12 mt-0 md:w-96 w-60 object-cover"
            src="../../assets/images/about/image-23.jpg"
            alt=""
          />
          <img
            className=" justify-self-end lg:mt-60 md:mt-32 mt-0 md:w-96 w-60 object-cover"
            src="../../assets/images/about/image-21.jpg"
            alt=""
          />
        </div>
      </div>
      <div className="bg-black container mx-auto text-white grid lg:grid-cols-2 grid-cols-1 lg:pt-0 pt-12 lg:mb-24 mb-16">
        <div className=" self-center lg:pr-12 pl-12 pr-0">
          <h1 className="md:text-5xl sm:text-4xl text-3xl sofia-medium mb-5 uppercase">
            our story
          </h1>
          <p className="2xl:text-base lg:text-15 sm:text-sm text-[12px] sm:text-left text-justify font-europa-light pr-12">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate
            ducimus voluptates architecto, sit eaque exercitationem adipisci
            rerum consequuntur necessitatibus quibusdam provident voluptatum
            porro! Suscipit explicabo voluptas porro incidunt fugiat tempore?
          </p>
        </div>
        <div className="grid grid-cols-2 p-12 gap-4">
          <img
            className="object-cover md:h-full h-80"
            src="../../assets/images/about/story1.jpg"
            alt=""
          />
          <img
            className="object-cover md:h-full h-80"
            src="../../assets/images/about/story2.jpg"
            alt=""
          />
        </div>
      </div>
    </div>
  );
}
