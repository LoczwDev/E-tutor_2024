import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useQuery } from "@tanstack/react-query";
import useUser from "./useUser";
import { getTokenStream } from "../services/chatService";
import images from "../constants/images/images";
import GetCookie from "./getCookie";

const apiKey = "769rbex4awnk";
export const useChatClient = () => {
  const accessTokenCookies = GetCookie("access_token");
  const [tokenProvider, setTokenProvider] = useState(null);
  const { data: dataTokenProvider, isLoading } = useQuery({
    queryFn: () => getTokenStream(),
    queryKey: ["TokenStreamChat"],
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
      const chatClient = StreamChat.getInstance(apiKey);
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

  return { chatClient, isLoading };
};
