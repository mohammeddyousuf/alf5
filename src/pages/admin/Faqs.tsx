import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { BackToDashboard } from "@/components/admin/BackToDashboard";

const Faqs = () => {
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const handleAddFaq = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in both question and answer fields.",
      });
      return;
    }

    const { error } = await supabase
      .from("faqs")
      .insert({
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add FAQ. Please try again.",
      });
      return;
    }

    toast({
      title: "Success",
      description: "FAQ added successfully.",
    });

    setNewQuestion("");
    setNewAnswer("");
    queryClient.invalidateQueries({ queryKey: ["faqs"] });
  };

  const handleDeleteFaq = async (id: string) => {
    const { error } = await supabase
      .from("faqs")
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete FAQ. Please try again.",
      });
      return;
    }

    toast({
      title: "Success",
      description: "FAQ deleted successfully.",
    });

    queryClient.invalidateQueries({ queryKey: ["faqs"] });
  };

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Manage FAQs</h1>
          <BackToDashboard />
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New FAQ</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Question</label>
              <Input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Enter question"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Answer</label>
              <Textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Enter answer"
                rows={4}
              />
            </div>
            <Button onClick={handleAddFaq} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          {faqs?.map((faq) => (
            <Card key={faq.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <h3 className="font-semibold">{faq.question}</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{faq.answer}</p>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteFaq(faq.id)}
                  className="ml-4"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Faqs;