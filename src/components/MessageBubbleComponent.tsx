import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ImageViewing from 'react-native-image-viewing';
import Video from 'react-native-video';
import { createThumbnail } from 'react-native-create-thumbnail';

export interface Message {
  id: string;
  text: string;
  time: string;
  isSent: boolean;
  status?: 'sending' | 'sent' | 'delivered';
  animated?: boolean;
  sendMediaLoading?: boolean;
}

interface MessageBubbleProps {
  msg: Message;
  animation: Animated.Value;
}

const MessageBubbleComponent: React.FC<MessageBubbleProps> = ({
  msg,
  animation,
}) => {
  const [visible, setVisible] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loadingThumb, setLoadingThumb] = useState(false);

  const BASE_URL = 'https://chattr-b.up.railway.app/';
  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(msg.text);
  const isVideo = /\.(mp4|mov|avi|mkv|webm|3gp|m4v)$/i.test(msg.text);
  const isMedia = isImage || isVideo;
  const mediaUrl = isMedia ? `${BASE_URL}${msg.text}` : null;

  // Video thumbnail
  useEffect(() => {
    if (isVideo && mediaUrl) {
      setLoadingThumb(true);
      createThumbnail({ url: mediaUrl, timeStamp: 1000 })
        .then(res => {
          setThumbnail(res.path);
        })
        .catch(err => console.log('Thumbnail error:', err))
        .finally(() => setLoadingThumb(false));
    }
  }, [mediaUrl, isVideo]);

  // Render media content
  const renderMediaContent = () => {
    if (!isMedia || !mediaUrl) return null;

    // Image message
    if (isImage) {
      return (
        <>
          <TouchableOpacity
            onPress={() => setVisible(true)}
            activeOpacity={0.9}
          >
            <View className="relative w-64 h-72 rounded-lg overflow-hidden mb-2 bg-gray-200">
              {/* {loadingMedia && (
                <View className="absolute inset-0 bg-black/40 justify-center items-center z-10">
                  <ActivityIndicator size="large" color="#5A0FC8" />
                  <Text className="text-primarydark mt-2 text-sm">
                    Loading image...
                  </Text>
                </View>
              )} */}
              <Image
                source={{ uri: mediaUrl }}
                className="w-64 h-72"
                resizeMode="cover"
              />
              {(msg.sendMediaLoading || msg.status === 'sending') && (
                <View className="absolute inset-0 bg-black/50 justify-center items-center z-20">
                  <ActivityIndicator size="large" color="#5A0FC8" />
                  <Text className="text-primarylight text-sm mt-2">
                    Sending...
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <ImageViewing
            images={[{ uri: mediaUrl }]}
            imageIndex={0}
            visible={visible}
            onRequestClose={() => setVisible(false)}
          />
        </>
      );
    }

    // Video message
    if (isVideo) {
      return (
        <View className="relative rounded-lg overflow-hidden mb-2 bg-black">
          {!showVideo ? (
            <TouchableOpacity
              onPress={() => setShowVideo(true)}
              activeOpacity={0.9}
            >
              {loadingThumb ? (
                <View className="w-64 h-72 justify-center items-center bg-primarylight">
                  <ActivityIndicator size="large" color="#7B3FD3" />
                  <Text className="text-primarylight mt-2 text-sm">
                    Loading...
                  </Text>
                </View>
              ) : (
                <Image
                  source={{
                    uri: thumbnail || `${BASE_URL}default-video-thumb.jpg`,
                  }}
                  className="w-64 h-72 bg-black"
                  resizeMode="cover"
                />
              )}
              <View className="absolute inset-0 justify-center items-center">
                <View className="bg-black/70 rounded-full p-4">
                  <Ionicons name="play" size={30} color="#fff" />
                </View>
              </View>

              {(msg.sendMediaLoading || msg.status === 'sending') && (
                <View className="absolute inset-0 bg-black/50 justify-center items-center z-20">
                  <ActivityIndicator size="large" color="#fff" />
                  <Text className="text-white text-sm mt-2">Sending...</Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <Video
              source={{ uri: mediaUrl }}
              style={{ width: 256, height: 288, borderRadius: 12 } as ViewStyle}
              resizeMode="contain"
              controls
              paused={false}
            />
          )}
        </View>
      );
    }

    return null;
  };

  return (
    <Animated.View
      style={{
        transform: [
          {
            translateY:
              animation?.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }) || 0,
          },
          {
            scale:
              animation?.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }) || 1,
          },
        ],
        opacity: animation || 1,
      }}
      className={`flex-row mb-3 ${msg.isSent ? 'justify-end' : 'justify-start'}`}
    >
      <View
        className={`${
          msg.isSent ? 'bg-primarydark' : 'bg-white'
        } rounded-2xl ${msg.isSent ? 'rounded-br-none' : 'rounded-tl-none'} px-3 py-3 ${
          isMedia ? 'max-w-[85%]' : 'max-w-[80%]'
        } overflow-hidden border ${
          msg.isSent ? 'border-primarydark' : 'border-gray-200'
        }`}
      >
        {renderMediaContent()}

        {!isMedia && (
          <Text
            className={`text-base ${msg.isSent ? 'text-white' : 'text-gray-800'}`}
          >
            {msg.text}
          </Text>
        )}

        <View
          className={`flex-row items-center justify-between mt-1 ${
            msg.isSent ? 'flex-row-reverse' : ''
          }`}
        >
          <Text
            className={`text-xs ${msg.isSent ? 'text-gray-300' : 'text-gray-500'}`}
          >
            {msg.time}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default MessageBubbleComponent;
