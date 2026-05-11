import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram
} from "lucide-react";
import { getContact } from "@/components/services/contact.services";
import ContactForm from "./contactForm";

async function Contact() {
  const response = await getContact();
  const contact = response.contacts;
  console.log(contact);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = {
      fullName: (form.elements.namedItem('fullName') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };
    console.log(formData);
  }
  return (
    <>
      <section className="pt-12 pb-10 px-4 bg-[#FAF8F5] relative">
        <div className="max-w-7xl mx-auto text-center fade-in">
          <span className="text-[#8B1E26] uppercase tracking-[0.2em] text-sm font-semibold mb-3 block">Kết nối với chúng tôi</span>
          <h2 className="font-serif text-4xl md:text-5xl text-[#2C2C2C] mb-6">Ghé Thăm Áo dài Hải</h2>
          <p className="text-[#9CA3AF] font-light max-w-2xl mx-auto text-lg">Chúng tôi luôn sẵn lòng lắng nghe và đồng hành cùng bạn để tạo ra những tà áo dài hoàn mỹ nhất.</p>
        </div>
      </section>
      <main className="flex-grow py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

            <div className="space-y-12 p-8">
              <div>
                <h2 className="font-serif text-3xl text-brand-dark mb-8">
                  {contact.showroomName}
                </h2>

                <div className="space-y-8">

                  {/* Address */}
                  <div className="flex items-start space-x-5 group">
                    <div className="w-12 h-12 bg-[#FAF8F5] group-hover:bg-[#8B1E26] group-hover:text-[#FAF8F5] transition-colors duration-300 rounded-full flex items-center justify-center text-[#8B1E26] flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-1">Showroom Chính</h3>
                      <p className="text-gray-600 font-light leading-relaxed">
                        {contact.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-5 group">
                    <div className="w-12 h-12 bg-[#FAF8F5] group-hover:bg-[#8B1E26] group-hover:text-[#FAF8F5] transition-colors duration-300 rounded-full flex items-center justify-center text-[#8B1E26] flex-shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-1">Điện Thoại</h3>
                      <p className="text-gray-600 font-light">
                        {contact.phoneHotline}
                      </p>
                      <p className="text-gray-600 font-light">
                        {contact.phoneStore}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-5 group">
                    <div className="w-12 h-12 bg-[#FAF8F5] group-hover:bg-[#8B1E26] group-hover:text-[#FAF8F5] transition-colors duration-300 rounded-full flex items-center justify-center text-[#8B1E26] flex-shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-1">Email</h3>
                      <p className="text-gray-600 font-light">
                        {contact.emailPrimary}
                      </p>
                      <p className="text-gray-600 font-light">
                        {contact.emailSupport}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-5 group">
                    <div className="w-12 h-12 bg-[#FAF8F5] group-hover:bg-[#8B1E26] group-hover:text-[#FAF8F5] transition-colors duration-300 rounded-full flex items-center justify-center text-[#8B1E26] flex-shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-1">Giờ Mở Cửa</h3>
                      <p className="text-gray-600 font-light">
                        {contact.weekday}
                      </p>
                      <p className="text-gray-600 font-light">
                        {contact.sunday}
                      </p>
                    </div>
                  </div>
                  <div >
                    <div className="space-x-5">

                      <div className="line-height-1 w-full h-[1px] bg-gray-200"></div>
                      <h3 className="font-medium text-lg mb-1 py-4">Theo dõi chúng tôi trên mạng xã hội</h3>

                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-[#FAF8F5] hover:bg-[#8B1E26] hover:text-[#FAF8F5] transition-colors duration-300 rounded-full flex items-center justify-center text-[#2c2c2c] cursor-pointer">
                          <Facebook className="w-5 h-5" />
                        </div>

                        <div className="w-12 h-12 bg-[#FAF8F5] hover:bg-[#8B1E26] hover:text-[#FAF8F5] transition-colors duration-300 rounded-full flex items-center justify-center text-[#2c2c2c] cursor-pointer">
                          <Instagram className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            <div className="space-y-12 flex flex-col bg-[#FAF8F5] p-8 w-full h-full">
              <ContactForm />
            </div>
          </div>
          <iframe className="pt-4" src={contact.mapEmbedUrl} frameBorder="0" style={{ width: '100%', height: '400px' }}></iframe>
        </div>
      </main>
    </>
  );
}

export default Contact;