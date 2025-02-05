import React, { useState } from "react";
import {
  FaLinkedinIn,
  FaTwitter,
  FaFacebookSquare,
  FaTelegram,
  FaEnvelope,
} from "react-icons/fa";

const ContactMe = () => {
  const socialLinks = [
    { href: "https://www.linkedin.com/in/yildizmehmet/", icon: FaLinkedinIn },
    { href: "https://twitter.com/albursavi", icon: FaTwitter },
    { href: "https://www.facebook.com/mehmetydev/", icon: FaFacebookSquare },
    { href: "https://t.me/memostar91", icon: FaTelegram },
    { href: "mailto:contact@mehmetyildiz.dev", icon: FaEnvelope },
  ];
  const [formData, setFormData] = useState({
    name: "",
    check: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setStatus("Please fill out all fields.");
      return;
    }
    if (formData.check !== "mehmet") {
      setStatus("The check field must contain the text 'mehmet'.");
      return;
    }

    // Simulate form submission
    setStatus("Request sent");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        window.alert(result.message);
        setFormData({ name: "", check: "mehmet", email: "", message: "" }); // Clear form
      } else {
        window.alert(result.error || "Failed to send message.");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      window.alert("An error occurred. Please try again.");
    }
  };

  return (
    <section className="h-full flex flex-col md:flex-row mx-auto p-2 rounded-xl shadow-md">
      <div className="flex flex-col w-full md:w-1/2 bg-diamond p-4 rounded-l-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="off"
              className="mt-1 block w-full px-3 py-2 border border-emerald rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gold"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
              className="mt-1 block w-full px-3 py-2 border border-emerald rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gold"
              required
            />
          </div>
          <div>
            <label htmlFor="check" className="block text-sm font-medium">
              Bot Check
            </label>
            <input
              type="text"
              id="check"
              name="check"
              value={formData.check}
              onChange={handleChange}
              placeholder="Enter 'mehmet'"
              autoComplete="off"
              className="mt-1 block w-full px-3 py-2 border border-emerald rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gold"
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              autoComplete="off"
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-emerald rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gold"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-emerald text-white py-2 px-4 rounded-md hover:bg-sapphire focus:outline-none focus:ring-2 focus:ring-gold cursor-pointer"
            >
              Submit
            </button>
          </div>
          {status && (
            <p
              className={`mt-4 text-center ${
                status.includes("successfully")
                  ? "text-ring"
                  : "text-destructive"
              }`}
            >
              {status}
            </p>
          )}
        </form>
      </div>

      <div className="w-full md:w-1/2 bg-diamond rounded-r-xl text-center flex flex-col p-4 mt-8 md:mt-0">
        <h2 className="text-2xl font-bold mb-6 text-center">Social Links</h2>
        <div className="flex items-center justify-center space-x-4">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              rel="noopener noreferrer"
              target="_blank"
              title={link.href.replace(/^https?:\/\//, "").split("/")[0]} // Extracts domain name
              style={{ animationDelay: `${index * 0.1}s` }} // Staggered animation delay
            >
              <div className="rounded-full shadow-md shadow-emerald cursor-pointer p-2 lg:p-3 hover:scale-110 ease-in duration-300">
                {/* Dynamically render the icon with the common className */}
                {React.createElement(link.icon, {
                  className: "text-emerald text-xl lg:text-xl",
                })}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactMe;
