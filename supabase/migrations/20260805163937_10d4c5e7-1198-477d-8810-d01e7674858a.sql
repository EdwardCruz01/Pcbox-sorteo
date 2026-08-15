CREATE POLICY "comprobantes upload" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'comprobantes');
CREATE POLICY "comprobantes admin read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'comprobantes' AND public.has_role(auth.uid(),'admin'));