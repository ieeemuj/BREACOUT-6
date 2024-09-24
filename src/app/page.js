"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Alert, Button, Spinner } from "flowbite-react";
import { useRouter } from "next/navigation";
import { FaArrowRight } from "react-icons/fa6";
chgfxg

const Home = () => {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const router = useRouter();
  
  const imageRefs = useRef([]);
  const containerRef = useRef(null);

  const images = [
    "https://s3-alpha-sig.figma.com/img/1977/e27a/fdb8cad12aa9192b8fa53c6675a30c0d?Expires=1727654400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=oY3tAeIh1j8-DI~oa900q-htcNHMt7rgBRW8YwRfliACscyK9woT7e-G2OA70vmsUJjVamRsMhufiVcoDcXf6oGcGm5IiRebNo8vp-F3brkivWLnT~hrUG5A4YW6Lc1bea3nOnkIasbfUTefjViOyPAW3C8h2Mq5KO047VrUiQSk1dOUkN830FyRQBtbkxaoQew4JKSiohC-vhppgYISxk1hzeU96rKhiaX~lWZPu4xPdrqRfGDh9XHR911YwpUZbb34zY~7jG2pl2I1tvXx1CGRUjLvV1juUHPGX5ZGGdPKRyuVTA849z9VVdYq0ueBpFOIlFKQIpnUvuNoiIVNzw__",
    "https://s3-alpha-sig.figma.com/img/e356/9642/6e4189206e1d70f8d8b06a0a0e8cbaf0?Expires=1727654400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Je7D2bcx3Ny0PvmTvrrScueYdkSYZWKC6dPnvjQrsgqxak6A39bQeEhM9KZmV5b0SgJmFhlV1A8x4mJdH14b9JLIqBBjnG6DlrTBKOMbLKexR-C4Ly1OZStx~Q8GhPJAc6-VXumbxCDP-xeEUJhaE3VqpbG3gH5K7F40-nVv7kwCnWJkRkD1SCE6HA7~Z1m28OjQLaKcKmoiz9Y~4nDslL-g5q1bGZR~gyGpktgerkB0jmLBKhlSazdGlrMAGGh3cYsqjMW399ny0DvgL7bqsErmGziQW3wQFoObcSUcmn-L3p-i7tKbr89HVHQUyRP-BOaYIpmJtOdFcqH1wh6rkw__",
    "https://s3-alpha-sig.figma.com/img/b426/cee7/0daa3bea7da24aba7ea7bbb3aead755d?Expires=1727654400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=ZXIYUhmr5zCs4Kbo0h97RNmN-3DqtKQD07gvh-kn1rfz7kjYrLvDMndLjf9YJIUTG0~bVnIr24BWfztVHpIt741rrpHkm6Wb~38842KE0ogNLZK3I6HLGBaWvOTgmxtYbu7LF3KKotSXQpeSte0FOUIj1hHq4jqYXlP2H2AcEQsxXdl7tf3tx-MhKArJ1PqNOEIfsRvGotlI3M17gvtMJ2ooroq41cTFPf~~k2GfQ2XcdKX342hK61HnHpwZ4JdVPHhJe3x6dHEVcAkXSKSrpPyzF5faCqUv2eDqznuQv5Fv1SRw7OxpqYx8Lc4CBRT9No0lpypi9LxivB5OvKH1pA__",
    "https://s3-alpha-sig.figma.com/img/315c/3ebd/0cda8fd003f9a7655853d8291bb2f36b?Expires=1727654400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Ivru5Om0VfeRLO~KugH-U4ksdIs8oGmekP8uOozKKanrRnlOXf4N2Iq7q8MgPELfl4jADrmdKUvoCJa5PJ6~KENFXIhAcEXBYApQdcC9OI~CAuGp9XGtkQLLE9XWHA95-6uy7uxCWhLBVgC~03aMtwvzMBGnjcRQToPZ2tWxISOQ2ofeIb3O5lVGUj8R4UTN-ywlRrym7SrsF1y7uAZQnx6EoVjklCiuqneBuz4CjxoLs9vEu9VQHK0VAXBNwKyCotkC7eCqz8tlka7plXUMhZaTeZoajXJSn25M~-VP3fDdecWTF8s~Fs1awdXld6ue3TLworfcnHe2Bg5CSy8a8g__"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username) {
      return setErrorMessage("Please fill all the details.");
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success === false) {
        return setErrorMessage(data.message);
      }

      setLoading(false);

      if (res.ok) {
        // Simulate server response for image selection (replace with actual logic)
        const selectedImageIndex = Math.floor(Math.random() * images.length);
        expandImage(selectedImageIndex);
      }
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  const expandImage = (index) => {
    setExpandedImage(index);
    
    // gsap.to(imageRefs.current[index], {
    //   duration: 1,
    //   width: '100vw',
    //   height: '100vh',
    //   position: 'fixed',
    //   top: 0,
    //   left: 0,
    //   zIndex: 50,
    //   ease: 'power2.inOut',
    //   onComplete: () => {
    //     // Navigate to next page after animation
    //     router.push("/gryffindor");
    //   }
    // });

    // gsap.to(containerRef.current, {
    //   duration: 1,
    //   opacity: 0,
    //   ease: 'power2.inOut'
    // });
  };

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return (
    <div className="h-screen w-full relative" ref={containerRef}>
      <div className="h-screen grid grid-cols-4">
        {images.map((src, index) => (
          <div key={index} className="h-full object-contain">
            <img
              ref={el => imageRefs.current[index] = el}
              className="h-full w-screen"
              src={src}
              alt={`Image ${index + 1}`}
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex flex-col justify-center items-center ">
        <div>
          <h1 className="font-bold text-center">
            <span className="text-2xl">WELCOME TO</span>
            <br />
            <span className="text-5xl custom-font">BREACOUT</span>
          </h1>
        </div>
        <div>
          <form
            className="flex flex-col gap-4 text-center px-24 py-12"
            onSubmit={handleSubmit}
          >
            <div className="w-22">
              <input
                type="text"
                placeholder="Username"
                className="w-full p-4 rounded-lg h-10"
                id="username"
                onChange={handleChange}
              />
            </div>
            <div className="w-22">
             
            </div>
            <Button
              gradientDuoTone="purpleToPink"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="">
                  <Spinner size="sm" />
                  <span className="pl-3">Loading</span>
                </div>
              ) : (
                <span className="font-bold text-xl border-2 px-6 py-2 rounded-2xl backdrop-blur-lg bg-white/30 border-white">
                  <FaArrowRight />
                </span>
              )}
            </Button>
          </form>
          {errorMessage && (
            <Alert
              className="mt-5 flex justify-center text-red-600 items-center w-full"
              color="failure"
            >
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;