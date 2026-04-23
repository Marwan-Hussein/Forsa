using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBaseEntityColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attendee_Users_Id",
                table: "Attendee");

            migrationBuilder.DropForeignKey(
                name: "FK_AttendeeAttendeeInterests_Attendee_AttendeeId",
                table: "AttendeeAttendeeInterests");

            migrationBuilder.DropForeignKey(
                name: "FK_AttendeeSubsOrganizers_Attendee_AttendeeId",
                table: "AttendeeSubsOrganizers");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Attendee_AttendeeId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Feedbacks_Attendee_AttendeeId",
                table: "Feedbacks");

            migrationBuilder.DropForeignKey(
                name: "FK_WishlistItems_Attendee_AttendeeId",
                table: "WishlistItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Attendee",
                table: "Attendee");

            migrationBuilder.RenameTable(
                name: "Attendee",
                newName: "Attendees");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "WishlistItems",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "WishlistItems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "WishlistItems",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "WishlistItems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "WishlistItems",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModifiedAt",
                table: "WishlistItems",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "WishlistItems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Users",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModifiedAt",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "PromoCodes",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "PromoCodes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "PromoCodes",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "PromoCodes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "PromoCodes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModifiedAt",
                table: "PromoCodes",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "PromoCodes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Places",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Places",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Places",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "Places",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Places",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModifiedAt",
                table: "Places",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "Places",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "PlaceMedias",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "PlaceMedias",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "PlaceMedias",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "PlaceMedias",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "PlaceMedias",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModifiedAt",
                table: "PlaceMedias",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "PlaceMedias",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "OrganizationTypes",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "OrganizationTypes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "OrganizationTypes",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "OrganizationTypes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "OrganizationTypes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModifiedAt",
                table: "OrganizationTypes",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "OrganizationTypes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Notification",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Notification",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Notification",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "Notification",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Notification",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModifiedAt",
                table: "Notification",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "Notification",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Feedbacks",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Feedbacks",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Feedbacks",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "Feedbacks",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Feedbacks",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModifiedAt",
                table: "Feedbacks",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "Feedbacks",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Events",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Events",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Events",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "Events",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Events",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModifiedAt",
                table: "Events",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "Events",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "EventMedias",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "EventMedias",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "EventMedias",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "EventMedias",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "EventMedias",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModifiedAt",
                table: "EventMedias",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "EventMedias",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Bookings",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Bookings",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Bookings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModifiedAt",
                table: "Bookings",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "BookingRequests",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "BookingRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "BookingRequests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "BookingRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "BookingRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModifiedAt",
                table: "BookingRequests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "BookingRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "AttendeeInterests",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "AttendeeInterests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "AttendeeInterests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "AttendeeInterests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "AttendeeInterests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModifiedAt",
                table: "AttendeeInterests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "AttendeeInterests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Attendees",
                table: "Attendees",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AttendeeAttendeeInterests_Attendees_AttendeeId",
                table: "AttendeeAttendeeInterests",
                column: "AttendeeId",
                principalTable: "Attendees",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Attendees_Users_Id",
                table: "Attendees",
                column: "Id",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AttendeeSubsOrganizers_Attendees_AttendeeId",
                table: "AttendeeSubsOrganizers",
                column: "AttendeeId",
                principalTable: "Attendees",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Attendees_AttendeeId",
                table: "Bookings",
                column: "AttendeeId",
                principalTable: "Attendees",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Feedbacks_Attendees_AttendeeId",
                table: "Feedbacks",
                column: "AttendeeId",
                principalTable: "Attendees",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WishlistItems_Attendees_AttendeeId",
                table: "WishlistItems",
                column: "AttendeeId",
                principalTable: "Attendees",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttendeeAttendeeInterests_Attendees_AttendeeId",
                table: "AttendeeAttendeeInterests");

            migrationBuilder.DropForeignKey(
                name: "FK_Attendees_Users_Id",
                table: "Attendees");

            migrationBuilder.DropForeignKey(
                name: "FK_AttendeeSubsOrganizers_Attendees_AttendeeId",
                table: "AttendeeSubsOrganizers");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Attendees_AttendeeId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Feedbacks_Attendees_AttendeeId",
                table: "Feedbacks");

            migrationBuilder.DropForeignKey(
                name: "FK_WishlistItems_Attendees_AttendeeId",
                table: "WishlistItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Attendees",
                table: "Attendees");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "WishlistItems");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "WishlistItems");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "WishlistItems");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "WishlistItems");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "WishlistItems");

            migrationBuilder.DropColumn(
                name: "LastModifiedAt",
                table: "WishlistItems");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "WishlistItems");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastModifiedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "PromoCodes");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "PromoCodes");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "PromoCodes");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "PromoCodes");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "PromoCodes");

            migrationBuilder.DropColumn(
                name: "LastModifiedAt",
                table: "PromoCodes");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "PromoCodes");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Places");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Places");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Places");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Places");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Places");

            migrationBuilder.DropColumn(
                name: "LastModifiedAt",
                table: "Places");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "Places");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "PlaceMedias");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "PlaceMedias");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "PlaceMedias");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "PlaceMedias");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "PlaceMedias");

            migrationBuilder.DropColumn(
                name: "LastModifiedAt",
                table: "PlaceMedias");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "PlaceMedias");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "OrganizationTypes");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "OrganizationTypes");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "OrganizationTypes");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "OrganizationTypes");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "OrganizationTypes");

            migrationBuilder.DropColumn(
                name: "LastModifiedAt",
                table: "OrganizationTypes");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "OrganizationTypes");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "LastModifiedAt",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "LastModifiedAt",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "LastModifiedAt",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "EventMedias");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "EventMedias");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "EventMedias");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "EventMedias");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "EventMedias");

            migrationBuilder.DropColumn(
                name: "LastModifiedAt",
                table: "EventMedias");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "EventMedias");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "LastModifiedAt",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "BookingRequests");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "BookingRequests");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "BookingRequests");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "BookingRequests");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "BookingRequests");

            migrationBuilder.DropColumn(
                name: "LastModifiedAt",
                table: "BookingRequests");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "BookingRequests");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "AttendeeInterests");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "AttendeeInterests");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "AttendeeInterests");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "AttendeeInterests");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "AttendeeInterests");

            migrationBuilder.DropColumn(
                name: "LastModifiedAt",
                table: "AttendeeInterests");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "AttendeeInterests");

            migrationBuilder.RenameTable(
                name: "Attendees",
                newName: "Attendee");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Attendee",
                table: "Attendee",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Attendee_Users_Id",
                table: "Attendee",
                column: "Id",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AttendeeAttendeeInterests_Attendee_AttendeeId",
                table: "AttendeeAttendeeInterests",
                column: "AttendeeId",
                principalTable: "Attendee",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AttendeeSubsOrganizers_Attendee_AttendeeId",
                table: "AttendeeSubsOrganizers",
                column: "AttendeeId",
                principalTable: "Attendee",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Attendee_AttendeeId",
                table: "Bookings",
                column: "AttendeeId",
                principalTable: "Attendee",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Feedbacks_Attendee_AttendeeId",
                table: "Feedbacks",
                column: "AttendeeId",
                principalTable: "Attendee",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WishlistItems_Attendee_AttendeeId",
                table: "WishlistItems",
                column: "AttendeeId",
                principalTable: "Attendee",
                principalColumn: "Id");
        }
    }
}
