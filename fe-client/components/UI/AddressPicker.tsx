'use client';

import { useState, useEffect, useCallback } from 'react';
import { Label } from '@/components/UI/label';
import { Input } from '@/components/UI/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/UI/select';

interface LocationItem {
  id: string;
  name: string;
  full_name: string;
}

export interface AddressValue {
  province: string;
  ward: string;
  street: string;
}

interface AddressPickerProps {
  onChange?: (address: AddressValue) => void;
  defaultValue?: Partial<AddressValue>;
}

const API_BASE = 'https://esgoo.net/api-tinhthanh-new';

export default function AddressPicker({
  onChange,
  defaultValue,
}: AddressPickerProps) {
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [wards, setWards] = useState<LocationItem[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedWardId, setSelectedWardId] = useState('');
  const [street, setStreet] = useState(defaultValue?.street ?? '');

  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);

  // =============================
  // Fetch Provinces
  // =============================
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch(`${API_BASE}/1/0.htm`);
        const json = await res.json();
        if (json.error === 0) {
          setProvinces(json.data ?? []);
        }
      } catch {
        setProvinces([]);
      } finally {
        setLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!defaultValue) return;
  
    const province = provinces.find(
      (p) => p.full_name === defaultValue.province
    );
  
    if (province) {
      setSelectedProvinceId(province.id);
      fetchWards(province.id);
    }
  
    setStreet(defaultValue.street ?? "");
  }, [defaultValue, provinces]);

  useEffect(() => {
    if (!defaultValue?.ward) return;
  
    const ward = wards.find(
      (w) => w.full_name === defaultValue.ward
    );
  
    if (ward) {
      setSelectedWardId(ward.id);
    }
  }, [wards, defaultValue]);

  // =============================
  // Fetch Wards
  // =============================
  const fetchWards = useCallback(async (provinceId: string) => {
    if (!provinceId) {
      setWards([]);
      return;
    }

    setLoadingWards(true);
    try {
      const res = await fetch(`${API_BASE}/2/${provinceId}.htm`);
      const json = await res.json();
      if (json.error === 0) {
        setWards(json.data ?? []);
      }
    } catch {
      setWards([]);
    } finally {
      setLoadingWards(false);
    }
  }, []);

  const getName = (list: LocationItem[], id: string) =>
    list.find((item) => item.id === id)?.full_name ?? '';

  const emitChange = useCallback(
    (pId: string, wId: string, st: string) => {
      onChange?.({
        province: getName(provinces, pId),
        ward: getName(wards, wId),
        street: st,
      });
    },
    [onChange, provinces, wards]
  );

  const handleProvinceChange = (id: string) => {
    setSelectedProvinceId(id);
    setSelectedWardId('');
    setWards([]);
    fetchWards(id);
    emitChange(id, '', street);
  };

  const handleWardChange = (id: string) => {
    setSelectedWardId(id);
    emitChange(selectedProvinceId, id, street);
  };

  const handleStreetChange = (value: string) => {
    setStreet(value);
    emitChange(selectedProvinceId, selectedWardId, value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Province */}
      <div className="space-y-2">
        <Label>Tỉnh / Thành phố</Label>
        <Select
          value={selectedProvinceId}
          onValueChange={handleProvinceChange}
          disabled={loadingProvinces}
          
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                loadingProvinces
                  ? 'Đang tải...'
                  : 'Chọn Tỉnh / Thành phố'
              }
            />
          </SelectTrigger>
          <SelectContent className="w-full h-64 border-none scrollbar-hide overflow-y-auto">
            {provinces.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ward */}
      <div className="space-y-2">
        <Label>Phường / Xã</Label>
        <Select
          value={selectedWardId}
          onValueChange={handleWardChange}
          disabled={!selectedProvinceId || loadingWards}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                loadingWards ? 'Đang tải...' : 'Chọn Phường / Xã'
              }
            />
          </SelectTrigger>
          <SelectContent className="w-full h-64 border-none scrollbar-hide overflow-y-auto">
            {wards.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Street */}
      <div className="space-y-2 md:col-span-2">
        <Label>Số nhà, tên đường</Label>
        <Input
          placeholder="Ví dụ: 123 Nguyễn Huệ"
          value={street}
          onChange={(e) => handleStreetChange(e.target.value)}
        />
      </div>
    </div>
  );
}