import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../supabase";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";
import { Session } from "@supabase/supabase-js";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Keyboard } from "react-native";
import { differenceInDays, differenceInHours, differenceInMinutes, formatDistanceToNow } from "date-fns";
import { User } from "../components/AuthStack";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

interface Post {
    id: number;
    created_at: string;
    content: string;
    user: User;
    user_id: string;
}

export default function Posts({ session }: { session: Session }) {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [page, setPage] = useState(0);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const bottomSettingsSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => [0.05, "100%"], []);
    const snapPoints2 = useMemo(() => [0.05, "25%"], []);
    const { width } = useWindowDimensions();
    const [text, setText] = useState("");
    const textInputRef = useRef<TextInput>(null);
    const [numposts, setNumPosts] = useState(0);
    const [shouldNullifySelectedPost, setShouldNullifySelectedPost] = useState(true);
    const shouldNullifyRef = useRef(true);

    console.log("selectedPost:", selectedPost);

    const handleSheetChanges = useCallback((index: number) => {
        console.log("handleSheetChanges", index);
        if (index !== -1) {
            setTimeout(() => {
                textInputRef.current?.focus();
            }, 50);
        } else {
            Keyboard.dismiss();
            // if (shouldNullifySelectedPost) setSelectedPost(null);
            if (shouldNullifyRef.current) setSelectedPost(null);
        }
    }, []);

    const handleSheet2Changes = useCallback((index: number) => {
        console.log("handleSheet2Changes:", index, shouldNullifyRef.current);
        // if (index === -1 && shouldNullifySelectedPost) setSelectedPost(null);
        if (index === -1 && shouldNullifyRef.current) setSelectedPost(null);
    }, []);

    const fetchPosts = async (page: number) => {
        console.log("page in fetchPosts:", page);
        const { data, error } = await supabase
            .from("posts")
            .select("*, user: users(*)")
            .order("created_at", { ascending: false })
            .range(page * 10, (page + 1) * 10 - 1);
        if (error) {
            console.error(error);
            Alert.alert(error.message);
        } else {
            console.log("posts data:", data);
            const formatted_data = data as unknown as Post[];
            setPosts((prevPosts) => [...prevPosts, ...formatted_data]);
        }
        setLoading(false);
    };

    // supabase.auth.signOut();

    useEffect(() => {
        fetchPosts(page);
    }, [page]);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase.from("posts").select("*");
            if (error) {
                console.error("Error fetching posts:", error);
                return;
            }
            setNumPosts(data.length);
        })();

        supabase
            .channel("room1")
            .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, async (payload) => {
                console.log("Change received!", payload);
                const payload_post = payload.new as unknown as Post;

                if (payload.eventType === "UPDATE")
                    setPosts((prevPosts) => {
                        const updatedPosts = prevPosts.map((post) => {
                            if (post.id === payload_post.id) return { ...post, content: payload_post.content };
                            return post;
                        });
                        return updatedPosts;
                    });
                else if (payload.eventType === "DELETE")
                    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== payload.old.id));
                else {
                    const { data, error } = await supabase
                        .from("posts")
                        .select("*, user: users(*)")
                        .eq("id", payload_post.id)
                        .single();

                    if (error) {
                        console.error("Error fetching new post:", error);
                        return;
                    }

                    const newPost = data as unknown as Post;

                    setPosts((prevPosts) => {
                        if (!prevPosts.find((post) => post.id === newPost.id)) return [newPost, ...prevPosts];
                        return prevPosts;
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeAllChannels();
        };
    }, []);

    const formatShortDuration = (createdAt: string) => {
        const now = new Date();
        const createdDate = new Date(createdAt);

        const minutes = differenceInMinutes(now, createdDate);
        if (minutes < 60) {
            return `${minutes}m`;
        }

        const hours = differenceInHours(now, createdDate);
        if (hours < 24) {
            return `${hours}h`;
        }

        const days = differenceInDays(now, createdDate);
        return `${days}d`;
    };

    if (loading) {
        return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: "center", alignItems: "center" }} />;
    }

    return (
        <View className="w-screen h-screen relative flex flex-col">
            <View className="w-full flex flex-row justify-between items-center mt-16 px-8">
                <Text className="text-4xl font-bold text-center text-white">Feed</Text>
                <TouchableOpacity
                    onPress={() => {
                        supabase.auth.signOut();
                    }}
                    className="bg-red-500 p-2 rounded-full w-24"
                >
                    <Text className="text-white text-xl font-semibold text-center">Logout</Text>
                </TouchableOpacity>
            </View>
            <ScrollView className="gap-[5vh] mt-4 mb-16">
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <View
                            key={index}
                            className="flex flex-col gap-[1.5vh] customshadow p-6 !items-start rounded-md w-full text-white"
                            style={{ borderBottomColor: "gray", borderBottomWidth: 1 }}
                        >
                            <View className="flex flex-row justify-between items-center w-full">
                                <View className="flex flex-row gap-2 items-center">
                                    <Text className="text-white text-xl font-semibold">{post.user.username}</Text>
                                    <Text className=" text-gray-500 text-2xl">⋅</Text>
                                    <Text className="text-gray-500 text-xl font-semibold">
                                        {formatShortDuration(post.created_at)}
                                    </Text>
                                </View>
                                {post.user_id === session.user.id && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedPost(post);
                                            // setShouldNullifySelectedPost(false);
                                            shouldNullifyRef.current = false;
                                            bottomSettingsSheetRef.current?.expand();
                                        }}
                                    >
                                        <Ionicons name="ellipsis-horizontal-sharp" size={30} color="#6b7280" />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <Text className="text-white text-xl">{post.content}</Text>
                        </View>
                    ))
                ) : (
                    <Text className="text-2xl text-center text-white">No posts yet!</Text>
                )}
                {/* if more than 10 posts and not all posts are in the list, show load more button */}
                {numposts > 10 && posts.length < numposts && (
                    <TouchableOpacity
                        onPress={() => setPage((prevPage) => prevPage + 1)}
                        className="bg-blue-500 p-2 rounded-full w-[25%] self-center mt-4"
                    >
                        <Text className="text-white text-xl font-semibold text-center">Load More</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
            <View className="absolute bottom-14 w-full flex items-end">
                <TouchableOpacity
                    className="rounded-full bg-blue-500 w-fit h-fit px-5 pt-3 pb-2 mr-6"
                    onPress={() => {
                        console.log("expanding:", bottomSheetRef.current);
                        // setShouldNullifySelectedPost(true);
                        shouldNullifyRef.current = true;
                        bottomSheetRef.current?.expand();
                    }}
                >
                    <Text className="text-white text-5xl font-bold">+</Text>
                </TouchableOpacity>
            </View>
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                handleIndicatorStyle={{ backgroundColor: "white", width: width * 0.133333333 }}
                backgroundStyle={{ backgroundColor: "black" }}
                onChange={handleSheetChanges}
                enableDynamicSizing={false}
                enablePanDownToClose={false}
            >
                <BottomSheetView className="bg-black !justify-start !items-start flex-1 p-8">
                    <BottomSheetView className="flex flex-row justify-between items-center w-full">
                        <TouchableOpacity
                            onPress={() => {
                                Keyboard.dismiss();
                                bottomSheetRef.current?.close();
                            }}
                        >
                            <Text className="text-white text-xl font-semibold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={async () => {
                                if (!text) Alert.alert("Please enter some text before posting!");
                                else {
                                    Keyboard.dismiss();
                                    if (selectedPost) {
                                        const { error } = await supabase
                                            .from("posts")
                                            .update({ content: text })
                                            .eq("id", selectedPost.id);
                                        if (error) {
                                            console.error("Error updating post:", error);
                                            Alert.alert(error.message);
                                            return;
                                        }
                                        Alert.alert("Post updated!");
                                    } else {
                                        const { error } = await supabase
                                            .from("posts")
                                            .insert({ content: text, user_id: session.user.id });
                                        if (error) {
                                            console.error("Error posting:", error);
                                            Alert.alert(error.message);
                                            return;
                                        }
                                        Alert.alert("Posted!");
                                    }
                                    setText("");
                                    bottomSheetRef.current?.close();
                                }
                            }}
                            className="bg-blue-500 p-2 rounded-full"
                        >
                            <Text className="text-xl text-white font-semibold w-16 text-center">
                                {selectedPost ? "Edit" : "Post"}
                            </Text>
                        </TouchableOpacity>
                    </BottomSheetView>
                    <TextInput
                        ref={textInputRef}
                        placeholder="What's on your mind?"
                        multiline
                        numberOfLines={4}
                        onChangeText={(text) => setText(text)}
                        value={text}
                        className="h-full text-2xl text-white w-full"
                    />
                </BottomSheetView>
            </BottomSheet>
            <BottomSheet
                ref={bottomSettingsSheetRef}
                index={-1}
                snapPoints={snapPoints2}
                handleIndicatorStyle={{ backgroundColor: "white", width: width * 0.133333333 }}
                backgroundStyle={{ backgroundColor: "black" }}
                onChange={handleSheet2Changes}
                enableDynamicSizing
            >
                <BottomSheetView className="bg-black !justify-start !items-start flex-1 p-8">
                    <TouchableOpacity
                        style={poststyles.bottomsheetpressables}
                        onPress={() => {
                            shouldNullifyRef.current = false; // Update ref immediately
                            // close this bottom sheet, then open the other one, passing the selected post
                            // setShouldNullifySelectedPost(false);
                            bottomSettingsSheetRef.current?.close();
                            setText(selectedPost?.content || "");
                            setTimeout(() => bottomSheetRef.current?.expand(), 300);
                        }}
                    >
                        <MaterialIcons name="edit" size={30} color="white" />
                        <Text className="text-white" style={poststyles.bottomsheetpressablestext}>
                            Edit
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={poststyles.bottomsheetpressables}
                        onPress={async () => {
                            // delete post
                            const { error } = await supabase.from("posts").delete().eq("id", selectedPost?.id);
                            if (error) {
                                console.error("Error deleting post:", error);
                                Alert.alert(error.message);
                                return;
                            }
                            Alert.alert("Post deleted!");
                            setSelectedPost(null);
                            bottomSettingsSheetRef.current?.close();
                        }}
                    >
                        <FontAwesome5 name="trash" size={30} color="red" />
                        <Text className="text-[#E84749]" style={poststyles.bottomsheetpressablestext}>
                            Delete
                        </Text>
                    </TouchableOpacity>
                </BottomSheetView>
            </BottomSheet>
        </View>
    );
}

const poststyles = StyleSheet.create({
    bottomsheetpressables: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingVertical: 18,
        width: "100%",
    },
    bottomsheetpressablestext: {
        fontSize: 20,
        fontWeight: 600,
        lineHeight: 28,
        marginLeft: 13,
    },
});
