using Application.Core.DTOs.AttendeeDTOs;
using Domain.Entities.AttendeeEntities;

namespace Application.Queries.Attendees
{
    public static class AttendeeQueryExtensions
    {
        public static IQueryable<Attendee> ApplyFilters(
            this IQueryable<Attendee> query,
            AttendeeSearchParameters parameters)
        {
            if (!string.IsNullOrWhiteSpace(parameters.FullName))
            {
                query = query.Where(a => a.FullName.Contains(parameters.FullName));
            }

            if (!string.IsNullOrWhiteSpace(parameters.UserName))
            {
                query = query.Where(a => a.UserName != null && a.UserName.Contains(parameters.UserName));
            }

            if (!string.IsNullOrWhiteSpace(parameters.Email))
            {
                query = query.Where(a => a.Email != null && a.Email.Contains(parameters.Email));
            }

            if (!string.IsNullOrWhiteSpace(parameters.Location))
            {
                query = query.Where(a => a.Location.Contains(parameters.Location));
            }

            return query;
        }

        public static IQueryable<Attendee> ApplySorting(
            this IQueryable<Attendee> query,
            AttendeeSearchParameters parameters)
        {
            if (string.IsNullOrWhiteSpace(parameters.SortBy))
            {
                return query.OrderBy(a => a.Id);
            }

            switch (parameters.SortBy.Trim().ToLower())
            {
                case "fullname":
                    return parameters.IsDescending
                        ? query.OrderByDescending(a => a.FullName)
                        : query.OrderBy(a => a.FullName);

                case "username":
                    return parameters.IsDescending
                        ? query.OrderByDescending(a => a.UserName)
                        : query.OrderBy(a => a.UserName);

                case "email":
                    return parameters.IsDescending
                        ? query.OrderByDescending(a => a.Email)
                        : query.OrderBy(a => a.Email);

                case "location":
                    return parameters.IsDescending
                        ? query.OrderByDescending(a => a.Location)
                        : query.OrderBy(a => a.Location);

                case "birthdate":
                    return parameters.IsDescending
                        ? query.OrderByDescending(a => a.BirthDate)
                        : query.OrderBy(a => a.BirthDate);

                case "loyaltypoint":
                    return parameters.IsDescending
                        ? query.OrderByDescending(a => a.LoyaltyPoint)
                        : query.OrderBy(a => a.LoyaltyPoint);

                case "createdat":
                    return parameters.IsDescending
                        ? query.OrderByDescending(a => a.CreatedAt)
                        : query.OrderBy(a => a.CreatedAt);

                default:
                    return query.OrderBy(a => a.Id);
            }
        }
    }
}