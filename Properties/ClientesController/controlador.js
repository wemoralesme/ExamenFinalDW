using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClientesAPI.Models;

namespace ClientesAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientesController : ControllerBase
    {
        private readonly ClientesDbContext _context;

        public ClientesController(ClientesDbContext context)
        {
            _context = context;
        }

        // Endpoint para la creación de clientes
        [HttpPost]
        public async Task<ActionResult<Cliente>> CrearCliente(Cliente cliente)
        {
            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(ObtenerClientePorId), new { id = cliente.ID }, cliente);
        }

        // Endpoint para obtener la información general ordenada
        [HttpGet("ListadoGeneral")]
        public async Task<ActionResult<IEnumerable<object>>> ListadoGeneral()
        {
            var listado = await _context.InformacionCliente
                .Include(info => info.Cliente)
                .OrderBy(info => info.FechaCreacion)
                .ThenBy(info => info.Cliente.Apellidos)
                .Select(info => new
                {
                    info.Cliente.Nombres,
                    info.Cliente.Apellidos,
                    info.TipoInformacion,
                    info.FechaCreacion,
                    info.FechaActualizacion,
                    info.UsuarioCreador,
                    info.EstadoInformacion
                })
                .ToListAsync();

            return Ok(listado);
        }

        // Método auxiliar para obtener un cliente por ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Cliente>> ObtenerClientePorId(int id)
        {
            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente == null)
            {
                return NotFound();
            }
            return cliente;
        }
    }
}dotnet ef migrations add InitialCreate