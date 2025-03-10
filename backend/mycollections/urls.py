from django.urls import path
from .views import (
    CreateCollectionRequestView,
    AdminCollectionApprovalView,
    ApprovedCollectionsView,
    EditCollectionView,
    ShareCollectionView,
    UnshareCollectionView,
    PublicCollectionsView,
    MemberApprovedCollectionsAPIView,
    DeleteCollectionView

)

urlpatterns = [
    # เส้นทางสำหรับการส่งคำขอเพิ่มคอลเล็กชั่น
    path(
        "collections/request/",
        CreateCollectionRequestView.as_view(),
        name="create-collection-request",
    ),

    # เส้นทางสำหรับ admin จัดการคำขอคอลเล็กชั่น
    path(
        "admin/collections/",
        AdminCollectionApprovalView.as_view(),
        name="admin-collection-list",
    ),
    path(
        "admin/collections/<int:pk>/",
        AdminCollectionApprovalView.as_view(),
        name="admin-collection-detail",
    ),

    # เส้นทางสำหรับดูคอลเล็กชั่นที่อนุมัติแล้ว
    path(
        "collections/approved/",
        ApprovedCollectionsView.as_view(),
        name="approved-collections",
    ),

    # เส้นทางสำหรับแก้ไขชื่อคอลเล็กชั่น
    path(
        "collections/<int:pk>/edit/",
        EditCollectionView.as_view(),
        name="edit-collection",
    ),

    path(
        "collections/<int:pk>/share/", 
        ShareCollectionView.as_view(), 
        name="share-collection"),

    path("collections/<int:pk>/unshare/", 
         UnshareCollectionView.as_view(), 
         name="unshare-collection"),

    path("collections/shared/", 
         PublicCollectionsView.as_view(), 
         name="shared-collections"),

    path(
        "collections/<int:pk>/delete/",
        DeleteCollectionView.as_view(),
        name="delete-collection",
    ),

    path(
    "members/<int:member_id>/collections/approved/",
    MemberApprovedCollectionsAPIView.as_view(),
    name="member-approved-collections",

),


]
