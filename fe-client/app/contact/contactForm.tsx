"use client";

import { useState } from "react";
import { Input } from "@/components/UI/input";
import { Textarea } from "@/components/UI/textarea";
import {
  sanitizePhoneInput,
  validateEmail,
  validateFullName,
  validatePhone,
} from "@/lib/validation";

function ContactForm() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const firstName = (
      form.elements.namedItem("firstName") as HTMLInputElement
    ).value;
    const lastName = (
      form.elements.namedItem("lastName") as HTMLInputElement
    ).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const message = (
      form.elements.namedItem("message") as HTMLTextAreaElement
    ).value;

    const errors: Record<string, string> = {};
    const fullName = `${firstName} ${lastName}`.trim();

    const nameResult = validateFullName(fullName);
    if (!nameResult.valid) errors.firstName = nameResult.message;

    const phoneResult = validatePhone(phone);
    if (!phoneResult.valid) errors.phone = phoneResult.message;

    const emailResult = validateEmail(email, { required: true });
    if (!emailResult.valid) errors.email = emailResult.message;

    if (!message.trim()) {
      errors.message = "Vui lòng nhập nội dung";
    } else if (message.trim().length < 10) {
      errors.message = "Nội dung phải có ít nhất 10 ký tự";
    } else if (message.trim().length > 1000) {
      errors.message = "Nội dung không được quá 1000 ký tự";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    console.log({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: sanitizePhoneInput(phone),
      message: message.trim(),
    });
    form.reset();
    setPhone("");
  };

  return (
    <>
      <h2 className="font-serif text-3xl text-brand-dark mb-8">Gửi lời nhắn</h2>
      <p className="text-gray-500 font-light mb-8">
        Vui lòng để lại thông tin, chúng tôi sẽ liên hệ lại với bạn trong thời
        gian sớm nhất.
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-between overflow-hidden flex-1"
      >
        <div className="form-group grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Input name="firstName" placeholder="Họ *" maxLength={25} />
            {fieldErrors.firstName && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.firstName}</p>
            )}
          </div>
          <div>
            <Input name="lastName" placeholder="Tên *" maxLength={25} />
          </div>
        </div>
        <div className="form-group mb-6">
          <Input name="email" type="email" placeholder="Email *" maxLength={100} />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
          )}
        </div>
        <div className="form-group mb-6">
          <Input
            name="phone"
            type="tel"
            inputMode="numeric"
            placeholder="Số điện thoại *"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
          />
          {fieldErrors.phone && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>
          )}
        </div>
        <div className="form-group mb-6">
          <Textarea
            name="message"
            placeholder="Nội dung *"
            rows={5}
            maxLength={1000}
          />
          {fieldErrors.message && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full px-6 py-3 bg-[#2c2c2c] text-white hover:bg-[#7A1A21] transition-colors duration-300"
        >
          Gửi
        </button>
      </form>
    </>
  );
}

export default ContactForm;
