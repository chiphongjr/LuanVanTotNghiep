import React, { useEffect, useState } from "react";
import avatar from "../assets/avatar.jpg";
import { useDispatch, useSelector } from "react-redux";
// import Header from "./Header";
import { deleteUser, fetchAllUsers, updateUserStatus } from "../store/slices/adminSlice";

const Users = () => {
  const [page, setPage] = useState(1);
  const { loading, users, totalUsers } = useSelector((state) => state.admin);
  const dispatch = useDispatch();

  const [maxPage, setMaxPage] = useState(null);

  useEffect(() => {
    dispatch(fetchAllUsers(page));
  }, [dispatch, page]);

  useEffect(() => {
    if (totalUsers !== undefined) {
      const newMax = Math.ceil(totalUsers / 10);
      setMaxPage(newMax || 1);
    }
  }, [totalUsers]);

  useEffect(() => {
    if (maxPage && page > maxPage) {
      setPage(maxPage);
    }
  }, [maxPage, page]);

  const handleDeleteUser = (id) => {
    dispatch(deleteUser(id, page));
  };

  return (
    <>
      <div className="flex-1 md:p-6">
        {/* <Header /> */}
        <h1 className="text-2xl font-bold">Tất cả người dùng</h1>
        <p className="text-sm text-gray-600 mb-6">Quản lý tất cả người dùng</p>

        <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
          <div
            className={`overflow-x-auto rounded-lg ${
              loading
                ? "p-10 shadow-none"
                : users && users.length > 0
                ? "shadow-lg"
                : ""
            }`}
          >
            {loading ? (
              <div className="w-40 h-40 mx-auto border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : users && users.length > 0 ? (
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-blue-100 text-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left">Ảnh</th>
                    <th className="py-3 px-4 text-left">Tên</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-left">Ngày đăng ký</th>
                    <th className="py-3 px-4 text-left">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => {
                    return (
                      <tr key={user.id} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <img
                            src={user?.avatar?.url || avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-md object-cover"
                          />
                        </td>
                        <td className="px-3 py-4">{user.name}</td>
                        <td className="px-3 py-4">{user.email}</td>
                        <td className="px-3 py-4">
                          {new Date(user.created_at).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>

                        <td className="px-3 py-4">
                          <button
                            className="text-white rounded-md cursor-pointer px-3 py-2 font-semibold bg-red-gradient"
                            onClick={() => {
                              handleDeleteUser(user.id);
                            }}
                          >
                            Xóa
                          </button>

                          <button onClick={()=>dispatch(updateUserStatus(user.id,user.status === "active" ? "blocked" : "active"))}
                            className={`text-white round-md cursor-pointer px-3 py-2 font-semibold ${user.status === "active" ? "bg-red-500" : "bg-green-500"}`}
                          >
                            {user.status === "active" ? "Khóa" : "Mở"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <h3 className="text-2xl p-6 font-bold">
                Không tìm thấy người dùng
              </h3>
            )}
          </div>

          {/* phan trang  */}
          {!loading && users.length > 0 && (
            <div className="flex justify-center mt-6 gap-4">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
              >
                Trước
              </button>
              <span className="px-4 py-2 text-gray-700">Trang {page}</span>
              <button
                onClick={() => setPage((prev) => Math.max(prev + 1))}
                disabled={maxPage === page}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Users;
