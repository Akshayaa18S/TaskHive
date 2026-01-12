import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

function GroupPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');
  const [editTask, setEditTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [inviteUserIdOrEmail, setInviteUserIdOrEmail] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchGroup();
    fetchTasks();
  }, [id, navigate]);

  const isCreator = group && user && group.creator?.id === user.id;

  const fetchGroup = async () => {
    try {
      const response = await api.get('/groups/my');
      const foundGroup = response.data.find((g) => g.id === id);
      setGroup(foundGroup);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/${id}`);
      setTasks(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!isCreator) return;
    try {
      await api.post('/tasks', {
        title: taskTitle,
        description: taskDescription,
        groupId: id,
        assignedTo: taskAssignedTo || null
      });
      setTaskTitle('');
      setTaskDescription('');
      setTaskAssignedTo('');
      setShowCreateTaskModal(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const startEditTask = (task) => {
    if (!isCreator) return;
    setEditTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditAssignedTo(task.assignedUser?.id || '');
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!isCreator || !editTask) return;
    try {
      await api.put(`/tasks/${editTask.id}`, {
        title: editTitle,
        description: editDescription,
        assignedTo: editAssignedTo || null
      });
      setEditTask(null);
      setEditTitle('');
      setEditDescription('');
      setEditAssignedTo('');
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to update task');
    }
  };

  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'PENDING' ? 'DONE' : 'PENDING';
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchTasks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!isCreator) return;
    try {
      await api.post('/groups/invite', {
        groupId: id,
        userIdOrEmail: inviteUserIdOrEmail
      });
      setInviteUserIdOrEmail('');
      setShowInviteModal(false);
      fetchGroup();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to invite user');
    }
  };

  if (!group) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-500 hover:underline"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-xl font-bold">{group.name}</h1>
          <div></div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Group Members</h2>
            {isCreator && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Invite Member
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {group.members.map((member) => (
              <div
                key={member.id}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded"
              >
                {member.user.name}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Tasks</h2>
          {isCreator && (
            <button
              onClick={() => setShowCreateTaskModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Create Task
            </button>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600">No tasks yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white p-6 rounded-lg shadow-md ${
                  task.status === 'DONE' ? 'opacity-75' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 ${
                      task.status === 'DONE' ? 'line-through text-gray-500' : ''
                    }`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}
                    <div className="flex gap-4 text-sm">
                      <span className={`px-3 py-1 rounded ${
                        task.status === 'DONE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </span>
                      {task.assignedUser && (
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
                          Assigned to: {task.assignedUser.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleTaskStatus(task.id, task.status)}
                      className={`px-4 py-2 rounded ${
                        task.status === 'DONE'
                          ? 'bg-yellow-500 hover:bg-yellow-600'
                          : 'bg-green-500 hover:bg-green-600'
                      } text-white`}
                    >
                      {task.status === 'DONE' ? 'Reopen' : 'Complete'}
                    </button>
                    {isCreator && (
                      <>
                        <button
                          onClick={() => startEditTask(task)}
                          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-bold mb-4">Create New Task</h3>
            <form onSubmit={handleCreateTask}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Assign To</label>
                <select
                  value={taskAssignedTo}
                  onChange={(e) => setTaskAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="">Unassigned</option>
                  {group.members.map((member) => (
                    <option key={member.user.id} value={member.user.id}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-bold mb-4">Invite Member</h3>
            <form onSubmit={handleInviteUser}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">User ID or Email</label>
                <input
                  type="text"
                  value={inviteUserIdOrEmail}
                  onChange={(e) => setInviteUserIdOrEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
                >
                  Invite
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-bold mb-4">Edit Task</h3>
            <form onSubmit={handleUpdateTask}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Assign To</label>
                <select
                  value={editAssignedTo}
                  onChange={(e) => setEditAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="">Unassigned</option>
                  {group.members.map((member) => (
                    <option key={member.user.id} value={member.user.id}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setEditTask(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupPage;
