"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader } from "lucide-react";
import { apiClient } from "@/api/client";
import { toast } from "sonner";
import { Formik } from "formik";
import * as Yup from "yup";

const CreateOrgSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Organization name must be at least 3 characters")
    .max(70, "Organization name must not exceed 70 characters")
    .required("Organization name is required"),
});

interface CreateOrganizationModalProps {
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export default function CreateOrganizationModal({
  onSuccess,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: CreateOrganizationModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const handleSubmit = async (values: { name: string }, { resetForm }: any) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/organizations", {
        name: values.name,
      });

      toast.success(response.data.message || "Organization created successfully!");
      resetForm();
      setOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== undefined && trigger !== null && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {(trigger === undefined || trigger === null) && (
        <DialogTrigger asChild>
          <Button className="bg-[#0A3A5C] hover:bg-[#0A3A5C]/90 gap-2">
            <Plus className="w-4 h-4" />
            New Organization
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>Create a new organization to manage documents and team members</DialogDescription>
        </DialogHeader>

        <Formik initialValues={{ name: "" }} validationSchema={CreateOrgSchema} onSubmit={handleSubmit}>
          {({ values, errors, touched, handleChange, handleSubmit }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Acme Corporation"
                  value={values.name}
                  onChange={handleChange}
                  disabled={loading}
                  className="border-gray-300"
                />
                {errors.name && touched.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#0A3A5C] hover:bg-[#0A3A5C]/90 gap-2" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Organization"
                  )}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
