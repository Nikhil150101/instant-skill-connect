-- Enable realtime for mentors table
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentors;

-- Enable realtime for sessions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;