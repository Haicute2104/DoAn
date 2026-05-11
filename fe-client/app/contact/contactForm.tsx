"use client"
import { Input } from "@/components/UI/input"
import { Textarea } from "@/components/UI/textarea"


function ContactForm() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = {
      firstName: (form.elements.namedItem('firstName') as HTMLInputElement).value,
      lastName: (form.elements.namedItem('lastName') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };
    console.log(formData);
    form.reset();
  }
  return (
    <>
      <h2 className="font-serif text-3xl text-brand-dark mb-8">Gửi lời nhắn</h2>
      <p className="text-gray-500 font-light mb-8">Vui lòng để lại thông tin, chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.</p>
      <form onSubmit={handleSubmit} className="flex flex-col justify-between overflow-hidden flex-1">
        <div className="form-group grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input name="firstName" placeholder="Họ *"></Input>
          <Input name="lastName" placeholder="Tên *"></Input>
        </div>
        <div className="form-group mb-6">
          <Input name="email" placeholder="Email *"></Input>
        </div>
        <div className="form-group mb-6">
          <Input name="phone" placeholder="Số điện thoại *"></Input>
        </div>
        <div className="form-group mb-6">
          <Textarea name="message" placeholder="Nội dung *" rows={5}></Textarea>
        </div>
        <button type="submit" className="w-full px-6 py-3 bg-[#2c2c2c] text-white hover:bg-[#7A1A21] transition-colors duration-300">Gửi</button>
      </form>
    </>
  )
}
export default ContactForm