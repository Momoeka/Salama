export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_id: string;
          username: string;
          email: string;
          avatar_url: string | null;
          bio: string | null;
          role: "user" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          username: string;
          email: string;
          avatar_url?: string | null;
          bio?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          username?: string;
          email?: string;
          avatar_url?: string | null;
          bio?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          caption: string;
          ai_description: string | null;
          tags: string[] | null;
          pinecone_id: string | null;
          visibility: "public" | "private" | "followers";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_url: string;
          caption: string;
          ai_description?: string | null;
          tags?: string[] | null;
          pinecone_id?: string | null;
          visibility?: "public" | "private" | "followers";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          image_url?: string;
          caption?: string;
          ai_description?: string | null;
          tags?: string[] | null;
          pinecone_id?: string | null;
          visibility?: "public" | "private" | "followers";
          created_at?: string;
          updated_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          actor_id: string | null;
          type: "like" | "comment" | "follow" | "system";
          post_id: string | null;
          message: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          actor_id?: string | null;
          type: "like" | "comment" | "follow" | "system";
          post_id?: string | null;
          message?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          actor_id?: string | null;
          type?: "like" | "comment" | "follow" | "system";
          post_id?: string | null;
          message?: string | null;
          read?: boolean;
          created_at?: string;
        };
      };
      donations: {
        Row: {
          id: string;
          donor_id: string | null;
          recipient_id: string | null;
          amount: number;
          currency: string;
          payment_id: string | null;
          status: "pending" | "completed" | "failed";
          created_at: string;
        };
        Insert: {
          id?: string;
          donor_id?: string | null;
          recipient_id?: string | null;
          amount: number;
          currency?: string;
          payment_id?: string | null;
          status?: "pending" | "completed" | "failed";
          created_at?: string;
        };
        Update: {
          id?: string;
          donor_id?: string | null;
          recipient_id?: string | null;
          amount?: number;
          currency?: string;
          payment_id?: string | null;
          status?: "pending" | "completed" | "failed";
          created_at?: string;
        };
      };
    };
  };
};
