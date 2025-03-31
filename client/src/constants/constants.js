import { AiFillDiscord } from "react-icons/ai";
import { FaFacebook, FaTelegram, FaTwitter } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";

export const navigation = [
    {
      id: "0",
      title: "Code",
      url: "/home/editor",
    },
    
    {
      id: "4",
      title: "WhiteBoard",
      url: "/whiteboard",
    },
    {
      id: "3",
      title: "PhotoShop",
      url: "/photoshop",
  },
    {
      id: "5",
      title: "Text Edit",
      url: "/editor",
  },
  {
      id: "6",
      title: "Chat",
      url: "/chat",
    },{
      id: "7",
      title: "Profile",
      url: "/profile",
  },
    
  ];


  export const features = [
    {
      id: "0",
      title: "Code",
      path: "/home/editor",
      text: "Write, Edit, Debug – Together! Collaborate on code in real-time with your team. Track changes and build projects seamlessly in a shared coding environment.",
      backgroundUrl: "./src/assets/feature/card-1.svg",
      imageUrl: "./src/assets/feature/code.jpg",
    },
    {
      id: "1",
      title: "PPT",
      path: "/ppt",
      text: "Polish Your Presentations with Ease! Work on slides together, add visuals, and refine your content in real-time.",
      backgroundUrl: "./src/assets/feature/card-2.svg",
      imageUrl: "./src/assets/feature/ppt.webp",
      light: true,
    },
    {
      id: "2",
      title: "Doc",
      path: "/docs",
      text: "Teamwork on Every Word! Edit, format, and review documents together. Stay in sync with comments, and live changes.",
      backgroundUrl: "./src/assets/feature/card-3.svg",
      imageUrl: "./src/assets/feature/doc2.avif",
    },
    {
      id: "3",
      title: "Photoshop",
      text: "Enhance & Create – Together! Edit images in real-time.",
      backgroundUrl: "./src/assets/feature/card-4.svg",
      imageUrl: "./src/assets/feature/photo.webp",
      light: true,
    },
    {
      id: "4",
      title: "Chatting",
      path: "/chat",
      text: "Stay in touch with your team or friends through real-time chatting. Share ideas, collaborate, and keep the conversation going seamlessly",
      backgroundUrl: "./src/assets/feature/card-1.svg",
      imageUrl: "./src/assets/feature/chat.jpg",
    },
    {
      id: "5",
      title: "ChatBot",
      text: "AI-Powered Conversations at Your Service! Enhance user experience with intelligent chatbots.",
      backgroundUrl: "./src/assets/feature/card-3.svg",
      imageUrl: "./src/assets/feature/image-2.png",
      light: "true",
    },
  ];

  export const socials = [
    {
      id: "0",
      title: "Discord",
      iconUrl: AiFillDiscord,
      url: "#",
    },
    {
      id: "1",
      title: "Twitter",
      iconUrl: FaTwitter,
      url: "#",
    },
    {
      id: "2",
      title: "Instagram",
      iconUrl: FaInstagram,
      url: "#",
    },
    {
      id: "3",
      title: "Telegram",
      iconUrl: FaTelegram,
      url: "#",
    },
    {
      id: "4",
      title: "Facebook",
      iconUrl: FaFacebook,
      url: "#",
    },
  ];
  


const server = 'http://localhost:3000';