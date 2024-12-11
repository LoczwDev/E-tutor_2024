import { useQuery } from "@tanstack/react-query";
import { createContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { getTokenStream } from "../services/chatService";
import images from "../constants/images/images";
import Loader from "../components/loader/Loader";
import useUser from "../hooks/useUser";
import { StreamChat } from "stream-chat";
import GetCookie from "../hooks/getCookie";

export const ChatContext = createContext(null);

const API_KEY = "769rbex4awnk"; // Your actual API key here
const ChatProvider = ({ children }) => {
  const accessTokenCookies = GetCookie("access_token");
  console.log(accessTokenCookies);
  
  const [tokenProvider, setTokenProvider] = useState(null);
  const { data: dataTokenProvider, isLoading } = useQuery({
    queryFn: () => getTokenStream(),
    queryKey: ["TokenStream"],
    onSuccess: (data) => {},
    enabled: !!accessTokenCookies,
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
    staleTime: 60000,
    cacheTime: 300000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isLoading) {
      setTokenProvider(dataTokenProvider?.token);
    }
  }, [isLoading, dataTokenProvider]);

  const [chatClient, setChatClient] = useState(null);
  const user = useUser();

  useEffect(() => {
    if (user && tokenProvider) {
      const chatClient = StreamChat.getInstance(API_KEY);
      chatClient.connectUser(
        {
          id: user._id,
          name: user.fullName || user._id,
          image: user.avatar?.url || images.AvatarCur,
        },
        tokenProvider
      );
      setChatClient(chatClient);
    }
  }, [user, tokenProvider]);

  if (user && !chatClient) return <Loader />;

  return (
    <ChatContext.Provider value={chatClient}>{children}</ChatContext.Provider>
  );
};

export default ChatProvider;
