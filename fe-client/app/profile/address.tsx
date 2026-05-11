'use client';
import {
  createAddress,
  updateAddress,
  deleteAddress,
  getListAddress,
  setDefaultAddress,
  AddressPayload
} from "@/components/services/user.services";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/UI/dialog";
import { Label } from "@/components/UI/label";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import { PencilLine, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import AddressPicker, { AddressValue } from "@/components/UI/AddressPicker";
import { useAlert } from "@/components/providers/AlertProvider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/UI/popover";
import { Checkbox } from "@/components/UI/checkbox";

interface AddressItem {
  _id?: string;
  fullName?: string;
  phone?: string;
  province?: string;
  ward?: string;
  street?: string;
  isDefault?: boolean;
}

function Address() {
  const { showAlert } = useAlert();
  const [open, setOpen] = useState(false);
  const [reload, setReload] = useState(false);
  const [listAddress, setListAddress] = useState<AddressItem[]>([]);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);
  const [formAddress, setFormAddress] = useState<AddressValue | null>(null);
  // load address
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const res = await getListAddress();
        const data = res as { address?: AddressItem[] };
        setListAddress(data.address ?? []);
      } catch {
        showAlert("error", "Không thể tải danh sách địa chỉ");
      }
    };
    fetchAddress();
  }, [reload]);
  // submit form (create / update)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: AddressPayload = {
      fullName: formData.get("fullName") as string,
      phone: formData.get("phone") as string,
      street: formAddress?.street as string,
      ward: formAddress?.ward as string,
      province: formAddress?.province as string
    };
    try {
      let res;
      if (editingAddress?._id) {
        res = await updateAddress(editingAddress._id, data);
      } else {
        res = await createAddress(data);
      }
      showAlert("success", res.message);
      setOpen(false);
      setEditingAddress(null);
      setFormAddress(null);
      setReload(!reload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra";
      showAlert("error", message);
    }
  };
  // edit
  const handleEdit = (item: AddressItem) => {
    setEditingAddress(item);
    setFormAddress({
      street: item.street ?? "",
      ward: item.ward ?? "",
      province: item.province ?? ""
    });
    setOpen(true);
  };
  // delete
  const handleDelete = async (id: string) => {
    try {
      const res = await deleteAddress(id);
      showAlert("success", res.message);
      setReload(!reload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra";
      showAlert("error", message);
    }
  };

  // set default address
  const handleSetDefault = async (id: string) => {
    try {
      const res = await setDefaultAddress(id);
      showAlert("success", res.message);
      setReload(!reload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Đặt địa chỉ mặc định thất bại";
      showAlert("error", message);
    }
  };

  return (
    <section className="bg-white p-8 border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-2xl text-brand-dark">
          Danh sách địa chỉ
        </h2>
        <Dialog
          open={open}
          onOpenChange={(value) => {
            setOpen(value);
            if (!value) {
              setEditingAddress(null);
              setFormAddress(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 text-[#D4AF37] hover:text-[#8B1E26] transition">
              <Plus className="w-4 h-4" />
              Thêm địa chỉ mới
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">
                {editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
              </DialogTitle>
              <DialogDescription>
                Vui lòng nhập thông tin địa chỉ giao hàng.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    required
                    defaultValue={editingAddress?.fullName}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    name="phone"
                    required
                    defaultValue={editingAddress?.phone}
                    placeholder="Nhập số điện thoại"
                  />

                </div>

              </div>

              <AddressPicker
                defaultValue={{
                  street: formAddress?.street,
                  ward: formAddress?.ward,
                  province: formAddress?.province,
                }}
                onChange={(address) => setFormAddress(address)}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full bg-[#8B1E26] text-white hover:bg-[#D4AF37]"
                >
                  {editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {/* List Address */}
      <div className="space-y-4">
        {listAddress.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-md flex justify-between items-center"
            style={item.isDefault ? { border: "1px solid #000" } : { border: "1px solid #fff" }}
          >
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-2">
              <Checkbox
                id={`default-${item._id}`}
                checked={!!item.isDefault}
                disabled={!!item.isDefault}
                onCheckedChange={() => {
                  if (!item.isDefault && item._id) handleSetDefault(item._id);
                }}
              />
              <Label
                htmlFor={`default-${item._id}`}
                className="cursor-pointer select-none"
              >
                Mặc định
              </Label>
              </div>
             <div>
             <p className="font-semibold">{item.fullName}</p>
              <p>{item.phone}</p>
              <p>
                {item.street}, {item.ward}, {item.province}
              </p>
             </div>
            </div>
            <div className="flex gap-2">
              {/* Edit */}
              <Button
                variant="outline"
                size="icon"
                className="text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white"
                onClick={() => handleEdit(item)}
              >
                <PencilLine className="w-4 h-4" />
              </Button>
              {/* Delete */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-[#8B1E26] hover:bg-[#8B1E26] hover:text-white"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 space-y-4">
                  <div>
                    <p className="font-semibold">Xóa địa chỉ</p>
                    <p className="text-sm text-muted-foreground">
                      Bạn có chắc muốn xóa địa chỉ này?
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      Hủy
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => item._id && handleDelete(item._id)}
                    >
                      Xóa
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Address;