'use client'
import { Modal, Button, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

function TwoModalsTachLop() {
  const [opened1, { open: open1, close: close1 }] = useDisclosure(false);
  const [opened2, { open: open2, close: close2 }] = useDisclosure(false);
  
  // Vô hiệu hóa lớp phủ cho Modal 2
  const modal2OverlayProps = { opacity: 0, pointerEvents: 'none' };

  return (
    <>
     <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600">
        Hello Tailwind v4 🚀
      </h1>
    </div>
      <Button onClick={open1}>Mở Cả Hai Modal</Button>

      {/* -------------------------------------- */}
      {/* Modal 1: Đặt ở vị trí Trái */}
      <Modal
        opened={opened1}
        onClose={close1}
        title="Modal 1 (Trái - Tương tác được)"
        zIndex={100}
        
        // **Điều chỉnh VỊ TRÍ để không bị Modal 2 che phủ**
        styles={{
          content: { 
            position: 'absolute',
            left: '10%',
            // Dịch chuyển Modal 1 sang bên trái hoàn toàn, thêm khoảng trống 20px
            transform: 'translateX(-100% - 20px)', 
          }
        }}
      >
        <p>Input và nội dung trong Modal 1.</p>
        <TextInput label="Input 1" placeholder="Bạn có thể nhập liệu ở đây" mb="md" />
        <Button onClick={open2}>Mở Modal 2</Button>
      </Modal>

      {/* -------------------------------------- */}
      {/* Modal 2: Đặt ở vị trí Phải */}
      <Modal
        opened={opened2}
        onClose={close2}
        title="Modal 2 (Phải - Không bị tắt)"
        zIndex={200}
        
        overlayProps={modal2OverlayProps} 
        closeOnClickOutside={false} // **Quan trọng:** Ngăn tự đóng
        
        // **Điều chỉnh VỊ TRÍ để không che Modal 1**
        styles={{
          content: { 
            position: 'absolute',
            right: '10%',
            // Dịch chuyển Modal 2 sang bên phải, tạo khoảng trống 20px
            transform: 'translateX(20px)', 
          }
        }}
      >
        <p>Input và nội dung trong Modal 2.</p>
        <TextInput label="Input 2" placeholder="Bạn có thể nhập liệu ở đây" mb="md" />
        <Button onClick={close2}>Đóng Modal 2</Button>
      </Modal>
    </>
  );
}

export default TwoModalsTachLop;