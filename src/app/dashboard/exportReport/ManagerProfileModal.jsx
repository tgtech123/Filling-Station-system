import { Edit, Mail, MapPin, Phone, X } from "lucide-react";

const ManagerProfileModal = ({onclose}) => {
    const managerData = {
        firstName: "Dave",
        lastName: "Johnson",
        stationName: "Flourish Station",
        email: "davejohnson2002@gmail.com",
        phone: "08134567253",
        state: "Benue",
        country: "Nigeria",
        zipCode: "455323",
        emegerncyContact: "09069572421"
    }
  return (
    <div className="fixed px-4 lg:px-0 inset-0  z-50 flex items-center justify-center bg-black/50">
      {/* modal box */}
      <div className="bg-white border-2 rounded-lg w-full max-w-[400px]  lg:max-w-[700px] p-3 max-h-[80vh] scrollbar-hide overflow-y-auto">
        <header className="flex justify-between">
            <div>
                <h3 className="text-[24px] font-semibold">Manager Profile</h3>
                <p>
                    Personal and employment information
                </p>
            </div>
            <div onClick={onclose} className="cursor-pointer">
                <X />
            </div>
        </header>

        <section className="mt-10 flex justify-between items-center">
            <div className="flex gap-4 items-center">
                <div>
                    {managerData.src ? 
                        <Image src={managerData.src} height={100} width={100} alt="manager pic" /> : 
                        <div className="bg-gray-400 flex justify-center items-center rounded-full h-[60px] text-sm w-[60px]">No img</div>
                    }
                </div>
                <div className="flex flex-col gap-2">
                    <h4 className="text-[22px] font-semibold">{managerData.firstName + " " + managerData.lastName}</h4>
                    <p>Station Manager - {managerData.stationName}</p>
                </div>
            </div>

            <div>
                <button className="flex gap-1 bg-[#0080ff] items-center text-white p-2 rounded-[10px] text-sm">Edit Profile <Edit /></button>
            </div>
        </section>

        <section className="mt-8">
            <div className="border-2 flex flex-wrap gap-4 justify-center lg:justify-between items-center p-3 rounded-[10px] border-gray-300">
                    <div className="text-[#0080ff] bg-[#d9edff] px-6 py-2 rounded-[10px]">Personal</div>
                    <div className="text-[#737373]">Station</div>
                    <div className="text-[#737373]">Employment</div>
                    <div className="text-[#737373]">Business</div>
                    <div className="text-[#737373]">Preferences</div>
            </div>
        </section>
    
        <section className="mt-14">

            <div>
                <h5 className="font-semibold text-lg">Personal Information</h5>
                <p>Your personal details and contact information</p>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                

                 <div>
                        <p className="font-semibold text-sm">First name</p>
                        <input type="text" value={managerData.firstName} className="w-full bg-[#e7e7e7] p-3 rounded-[8px]" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Last name</p>
                        <input type="text" value={managerData.lastName} className="w-full bg-[#e7e7e7] p-3 rounded-[8px]" />
                    </div>
                    <div className="relative">
                        <p className="font-semibold text-sm">Email Address</p>
                        <input type="text" value={managerData.email} className="w-full bg-[#e7e7e7] p-3 pl-10 rounded-[8px]" />
                        <Mail className="text-sm absolute top-8 left-3" />
                    </div>
                    <div className="relative">
                        <p className="font-semibold text-sm">Phone number</p>
                        <input type="text" value={managerData.phone} className="w-full bg-[#e7e7e7] p-3 pl-10 rounded-[8px]" />
                        <Phone className="text-sm absolute top-8 left-3" />
                    </div>
                    <div className="relative col-span-1 lg:col-span-2">
                        <p className="font-semibold text-sm">Address</p>
                        <input type="text" value={managerData.email} className="w-full bg-[#e7e7e7] p-3 pl-10 rounded-[8px]" />
                        <MapPin className="text-sm absolute top-8 left-3" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">State</p>
                        <input type="text" value={managerData.state} className="w-full bg-[#e7e7e7] p-3 rounded-[8px]" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Country</p>
                        <input type="text" value={managerData.country} className="w-full bg-[#e7e7e7] p-3 rounded-[8px]" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Zip Code</p>
                        <input type="text" value={managerData.zipCode} className="w-full bg-[#e7e7e7] p-3 rounded-[8px]" />
                    </div>
                    <div className="relative">
                        <p className="font-semibold text-sm">Zip Code</p>
                        <input type="text" value={managerData.zipCode} className="w-full bg-[#e7e7e7] p-3 pl-10 rounded-[8px]" />
                        <Phone className="text-sm absolute top-8 left-3" />
                    </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default ManagerProfileModal;
