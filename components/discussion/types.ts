export type ThreadType = "POLL" | "TOPIC" | "FEEDBACK";
export type SortKey = "newest" | "popular" | "title";

export type ThreadDTO = {
    id: string;
    title: string;
    type: ThreadType;
    pollId?: string | null;
    commentCount: number;
    likeCount: number;
    createdAt: string;
    createdBy: {
        id: string;
        name: string | null;
        team?: { slug?: string | null } | null;
        rank?: { title?: string | null } | null;
    };
};

export type CommentDTO = {
    id: string;
    content: string;
    isAnonymous: boolean;
    createdAt: string;
    likeCount: number;
    replyCount: number;
    user: {
        id: string | null;
        name: string | null;
        rank?: { title?: string | null } | null;
        team?: { slug?: string | null } | null;
    } | null;
};

export type PollSummary = {
    id: string;
    question: string;
    createdAt?: string;
};
