// components/modals/modal-provider.tsx
'use client'

import { useUIStore } from '@/lib/stores/ui-store'
import { CreateProjectModal } from '@/components/modals/create-project-modal'
import { CreateTaskModal } from '@/components/modals/create-task-modal'
import { InviteTeamMember } from '@/components/modals/invite-collaborator-modal'

export function ModalProvider() {
  const { activeModal, setActiveModal } = useUIStore()
  
  const closeModal = () => setActiveModal(null)

  return (
    <>
      <CreateProjectModal
        open={activeModal === 'create-project'}
        onOpenChange={(open) => !open && closeModal()}
      />
      <CreateTaskModal
        open={activeModal === 'create-task'}
        onOpenChange={(open) => !open && closeModal()}
      />
      {/* Using the updated InviteTeamMember component as a modal */}
      {activeModal === 'invite-collaborator' && (
        <InviteTeamMember
          onInviteSent={(invitation) => {
            console.log('Invitation sent:', invitation)
            closeModal()
          }}
        />
      )}
    </>
  )
}