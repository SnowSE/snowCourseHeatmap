import { FC, useState } from 'react'
import { useCourseChanges } from '@/components/scheduler/contexts/CourseChangesContext'
import {
  useCreateChangeGroup,
  useDeleteChangeGroup,
  useRenameChangeGroup,
} from '@/hooks/useCourseChangeGroups'
import { TextInput } from '@/components/form/TextInput'

export const CourseChangesGroupSelector: FC = () => {
  const { activeGroupName, groupNames, groups, setActiveGroupName } =
    useCourseChanges()

  const createGroupMutation = useCreateChangeGroup()
  const deleteGroupMutation = useDeleteChangeGroup()
  const renameGroupMutation = useRenameChangeGroup()

  const [isCreating, setIsCreating] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [editGroupName, setEditGroupName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleCreateGroup = async () => {
    try {
      setError(null)
      if (!newGroupName.trim()) {
        setError('Group name cannot be empty')
        return
      }
      if (groupNames.includes(newGroupName)) {
        setError('Group name already exists')
        return
      }
      await createGroupMutation.mutateAsync(newGroupName)
      setActiveGroupName(newGroupName)
      setNewGroupName('')
      setIsCreating(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create group')
    }
  }

  const handleRenameGroup = async (oldName: string) => {
    try {
      setError(null)
      if (!editGroupName.trim()) {
        setError('Group name cannot be empty')
        return
      }
      if (groupNames.includes(editGroupName)) {
        setError('Group name already exists')
        return
      }
      const group = groups.find((g) => g.name === oldName)
      if (!group) return

      await renameGroupMutation.mutateAsync({
        groupId: group.id,
        newName: editGroupName,
      })
      if (activeGroupName === oldName) {
        setActiveGroupName(editGroupName)
      }
      setEditingGroup(null)
      setEditGroupName('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to rename group')
    }
  }

  const handleDeleteGroup = async (groupName: string) => {
    if (
      confirm(
        `Are you sure you want to delete the group "${groupName}"? This will remove all course changes in this group.`,
      )
    ) {
      const group = groups.find((g) => g.name === groupName)
      if (!group) return

      await deleteGroupMutation.mutateAsync(group.id)
      if (activeGroupName === groupName) {
        setActiveGroupName(null)
      }
    }
  }

  const startEditing = (groupName: string) => {
    setEditingGroup(groupName)
    setEditGroupName(groupName)
    setError(null)
  }

  const cancelEditing = () => {
    setEditingGroup(null)
    setEditGroupName('')
    setError(null)
  }

  return (
    <div className=" space-y-3  px-3 py-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-200">Change Groups</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="px-3 py-1 text-sm bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded transition-colors"
          title="Create new group"
        >
          + New Group
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
          {error}
        </div>
      )}

      {!activeGroupName && groupNames.length > 0 && (
        <div className="text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-2">
          Select a group to view or make course changes
        </div>
      )}

      {isCreating && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleCreateGroup()
          }}
          className="bg-slate-800/50 border border-slate-600 rounded p-3 space-y-2"
        >
          <TextInput
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            label="Group Name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsCreating(false)
                setNewGroupName('')
                setError(null)
              }
            }}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-3 py-1 text-sm bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded transition-colors"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false)
                setNewGroupName('')
                setError(null)
              }}
              className="px-3 py-1 text-sm bg-slate-600/50 hover:bg-slate-600/70 border border-slate-500/50 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {groupNames.length === 0 && !isCreating && (
          <div className="text-sm text-slate-400 text-center py-4">
            No groups yet. Create one to start making course changes.
          </div>
        )}

        {groupNames.map((groupName) => (
          <div
            key={groupName}
            className={`border rounded px-3 py-1 transition-colors ${
              activeGroupName === groupName
                ? 'bg-blue-500/20 border-blue-500/50'
                : 'bg-slate-800/30 border-slate-600 hover:border-slate-500'
            }`}
          >
            {editingGroup === groupName ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleRenameGroup(groupName)
                }}
                className="space-y-2"
              >
                <TextInput
                  label="Group Name"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      cancelEditing()
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-3 py-1 text-sm bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-3 py-1 text-sm bg-slate-600/50 hover:bg-slate-600/70 border border-slate-500/50 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveGroupName(groupName)}
                  className="flex-1 text-left font-medium text-slate-200"
                >
                  {groupName}
                  {activeGroupName === groupName && (
                    <span className="ml-2 text-xs text-blue-400">● Active</span>
                  )}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditing(groupName)}
                    className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                    title="Rename group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(groupName)}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
