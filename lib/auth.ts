import { cache } from "react";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  return prisma.user.findUnique({
    where: { id: authUser.id },
    include: { clinic: true },
  });
});
