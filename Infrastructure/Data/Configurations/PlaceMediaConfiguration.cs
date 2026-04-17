using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data.Configurations
{
    internal class PlaceMediaConfiguration : IEntityTypeConfiguration<PlaceMedia>
    {
        public void Configure(EntityTypeBuilder<PlaceMedia> builder)
        {
            throw new NotImplementedException();
        }
    }
}
