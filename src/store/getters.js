const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  userId: state => state.user.id,
  tel: state => state.user.tel,
  role: state => state.user.role,
  permission_routes: state => state.permission.routes
}
export default getters
