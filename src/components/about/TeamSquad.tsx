import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import "../../styles/teamsquad.css";

const TeamSquad = () => {
  const [members, setMembers] = useState<any[]>([]);

  const getMembers = async () => {
    const membersData = await getDocs(collection(db, "members"));
    const membersArray: any[] = [];
    membersData.forEach((docData) => {
      membersArray.push(docData.data());
    });
    setMembers(membersArray);
  };

  useEffect(() => {
    getMembers();
  }, []);

  return (
    <div className="bg-black">
      <div className="px-4">
        <div className="container mx-auto 2xl:px-16 text-white lg:pb-24 pb-16">
          <div className="grid 2xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8 lg:pt-24 pt-16">
            <div className="2xl:ml-0 sm:ml-12 ml-0">
              <div>
                <h1 className="md:text-5xl sm:text-4xl text-3xl sofia-medium sm:mb-5 mb-2 uppercase">
                  Team Squad
                </h1>
                <p className="uppercase sofia-pro sm:text-15 text-[13px] tracking-widest sm:mb-5 mb-2">
                  We have 10 Talent 3D Artists
                </p>
              </div>
            </div>

            {members.map((member, index) => (
              <div
                key={index}
                className="border card-team transition-all duration-500 text-black bg-[#FAF6F3] border-solid p-8"
              >
                <div className="w-full h-72 overflow-hidden">
                  <img
                    loading="lazy"
                    className="w-full h-full object-cover transition-all duration-500"
                    src={member.avatar}
                    alt={member.fullname}
                  />
                </div>
                <div className="flex items-end justify-between">
                  <div className="mt-6">
                    <p className="text-2xl font-heading-test uppercase">
                      {member.fullname}
                    </p>
                    <p className="font-heading-test font-medium tracking-wider">
                      {member.position}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamSquad;
