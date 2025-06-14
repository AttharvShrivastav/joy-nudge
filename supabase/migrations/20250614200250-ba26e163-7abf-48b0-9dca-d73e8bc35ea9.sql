
-- Create storage bucket for default avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('default_avatars', 'default_avatars', true, 1048576, ARRAY['image/png', 'image/webp', 'image/jpeg']);

-- Create RLS policies for the default_avatars bucket with unique names
CREATE POLICY "Default Avatars Public Select" ON storage.objects FOR SELECT USING (bucket_id = 'default_avatars');
CREATE POLICY "Default Avatars Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'default_avatars');

-- Add selected_avatar_url field to users table
ALTER TABLE public.users ADD COLUMN selected_avatar_url VARCHAR;

-- Update the handle_new_user function to set a default avatar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, selected_avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    'https://huowfziyvqqnoozdsuaw.supabase.co/storage/v1/object/public/default_avatars/avatar_1.png'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
