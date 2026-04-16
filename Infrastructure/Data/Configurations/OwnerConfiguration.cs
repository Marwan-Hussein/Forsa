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
    internal class OwnerConfiguration : IEntityTypeConfiguration<Owner>
    {
        public void Configure(EntityTypeBuilder<Owner> O)
        {


            O.HasKey(o => o.OwnerId);

            O.HasOne(o => o.user)
                .WithOne(o => o.Owner)
                .HasForeignKey<Owner>(o=> o.UserId);
        }
    }
}
